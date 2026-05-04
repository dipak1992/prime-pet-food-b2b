import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { Resend } from "resend";

const STEP_DELAYS = [0, 3, 4, 3, 7];
const MAX_STEP = STEP_DELAYS.length;

function nextSendAtForStep(step: number): Date {
  const delay = STEP_DELAYS[step - 1] ?? 3;
  const d = new Date();
  d.setDate(d.getDate() + delay);
  return d;
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const settingKey = "reorder-reminders:last-run-date";
  const lastRun = await prisma.setting.findUnique({ where: { key: settingKey } });
  if (lastRun?.value === todayKey) {
    return NextResponse.json({ skipped: true, reason: "Already processed today" });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const latestOrders = await prisma.order.groupBy({
    by: ["customerId"],
    _max: { createdAt: true },
  });

  const dueCustomerIds = latestOrders
    .filter((row) => row._max.createdAt && row._max.createdAt < cutoff)
    .map((row) => row.customerId)
    .slice(0, 50);

  const customers = await prisma.customer.findMany({
    where: { id: { in: dueCustomerIds }, accountStatus: "APPROVED" },
    include: {
      user: { select: { email: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { items: { take: 3 } },
      },
    },
  });

  const results = await Promise.all(
    customers.map((customer) => {
      const lastOrder = customer.orders[0];
      return sendEmail({
        to: customer.user.email,
        template: "reorder-reminder",
        variables: {
          businessName: customer.businessName,
          lastOrderNumber: lastOrder?.orderNumber || "",
          products:
            lastOrder?.items.map((item) => item.productTitleSnapshot).join(", ") ||
            "your previous best sellers",
          reorderUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/quick-order`,
        },
      }).catch((error) => ({ error: error instanceof Error ? error.message : "Email failed" }));
    })
  );

  await prisma.setting.upsert({
    where: { key: settingKey },
    create: { key: settingKey, value: todayKey },
    update: { value: todayKey },
  });

  const leadAutomation = await processLeadFollowUps();

  return NextResponse.json({
    processed: customers.length,
    results,
    leadAutomation,
  });
}

async function processLeadFollowUps() {
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true, reason: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.FROM_EMAIL ?? "outreach@theprimepetfood.com";
  const now = new Date();

  const dueSequences = await prisma.leadFollowUpSequence.findMany({
    where: {
      status: "ACTIVE",
      nextSendAt: { lte: now },
    },
    include: { lead: true },
    take: 50,
  });

  let sequenceSent = 0;
  let sequenceFailed = 0;

  for (const sequence of dueSequences) {
    const existingEmail = await prisma.outreachEmail.findFirst({
      where: { leadId: sequence.leadId, sequenceStep: sequence.currentStep },
      orderBy: { createdAt: "desc" },
    });
    const subject = existingEmail?.subject ?? `Following up - ${sequence.lead.businessName}`;
    const body =
      existingEmail?.body ??
      `Hi ${sequence.lead.contactName},\n\nI wanted to follow up about Prime Pet Food wholesale opportunities.\n\nBest,\nPrime Pet Food Team`;

    try {
      await resend.emails.send({
        from,
        to: sequence.lead.email,
        subject,
        text: body,
      });

      if (existingEmail?.status === "DRAFT") {
        await prisma.outreachEmail.update({
          where: { id: existingEmail.id },
          data: { status: "SENT", sentAt: now },
        });
      }

      const nextStep = sequence.currentStep + 1;
      const complete = nextStep > MAX_STEP;
      await prisma.leadFollowUpSequence.update({
        where: { id: sequence.id },
        data: {
          currentStep: complete ? sequence.currentStep : nextStep,
          status: complete ? "COMPLETED" : "ACTIVE",
          nextSendAt: complete ? null : nextSendAtForStep(nextStep),
          completedAt: complete ? now : null,
        },
      });

      if (sequence.lead.status === "NEW") {
        await prisma.lead.update({
          where: { id: sequence.leadId },
          data: { status: "CONTACTED", contactedAt: now },
        });
      }

      await prisma.leadActivity.create({
        data: {
          leadId: sequence.leadId,
          type: "SEQUENCE_EMAIL_SENT",
          title: `Sequence step ${sequence.currentStep} sent: "${subject}"`,
        },
      });
      sequenceSent++;
    } catch {
      await prisma.leadActivity.create({
        data: {
          leadId: sequence.leadId,
          type: "SEQUENCE_EMAIL_FAILED",
          title: `Sequence step ${sequence.currentStep} failed to send`,
        },
      });
      sequenceFailed++;
    }
  }

  const ownershipSettings = await prisma.setting.findMany({
    where: { key: { startsWith: "lead-owner:" } },
    take: 200,
  });
  let ownerRemindersSent = 0;

  for (const setting of ownershipSettings) {
    const ownership = JSON.parse(setting.value) as {
      ownerName?: string;
      ownerEmail?: string;
      nextFollowUpAt?: string;
      notes?: string;
    };
    if (!ownership.ownerEmail || !ownership.nextFollowUpAt) continue;
    const dueAt = new Date(ownership.nextFollowUpAt);
    if (Number.isNaN(dueAt.getTime()) || dueAt > now) continue;

    const leadId = setting.key.replace("lead-owner:", "");
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.status === "CONVERTED" || lead.status === "ARCHIVED") continue;

    await resend.emails.send({
      from,
      to: ownership.ownerEmail,
      subject: `Follow up with ${lead.businessName}`,
      text: `Follow-up is due for ${lead.businessName}.\n\nContact: ${lead.contactName}\nEmail: ${lead.email}\nNotes: ${ownership.notes || "No notes"}\n\nOpen the lead: ${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/outreach/${lead.id}`,
    });

    const nextFollowUp = new Date(now);
    nextFollowUp.setDate(nextFollowUp.getDate() + 7);
    await prisma.setting.update({
      where: { key: setting.key },
      data: {
        value: JSON.stringify({
          ...ownership,
          nextFollowUpAt: nextFollowUp.toISOString(),
        }),
      },
    });
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "OWNER_REMINDER_SENT",
        title: `Follow-up reminder sent to ${ownership.ownerName || ownership.ownerEmail}`,
        detail: "Next reminder moved forward 7 days.",
      },
    });
    ownerRemindersSent++;
  }

  return {
    sequencesProcessed: dueSequences.length,
    sequenceSent,
    sequenceFailed,
    ownerRemindersSent,
  };
}
