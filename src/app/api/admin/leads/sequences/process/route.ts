import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

// Called by a cron job (e.g. Vercel Cron) — no auth guard, protected by CRON_SECRET header
const STEP_DELAYS = [0, 3, 4, 3, 7]; // delay in days before each step (5 total steps, 1-indexed)
const MAX_STEP = STEP_DELAYS.length;

function nextSendAtForStep(step: number): Date {
  const delay = STEP_DELAYS[step - 1] ?? 3;
  const d = new Date();
  d.setDate(d.getDate() + delay);
  return d;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  const resend = new Resend(resendKey);
  const FROM = process.env.FROM_EMAIL ?? "outreach@theprimepetfood.com";

  const now = new Date();

  // Find all active sequences due to send
  const due = await prisma.leadFollowUpSequence.findMany({
    where: {
      status: "ACTIVE",
      nextSendAt: { lte: now },
    },
    include: {
      lead: true,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const seq of due) {
    const { lead, currentStep } = seq;

    // Find or generate email for this step
    const existingEmail = await prisma.outreachEmail.findFirst({
      where: { leadId: lead.id, sequenceStep: currentStep },
      orderBy: { createdAt: "desc" },
    });

    const subject = existingEmail?.subject ?? `Following up — ${lead.businessName}`;
    const body =
      existingEmail?.body ??
      `Hi ${lead.contactName},\n\nI wanted to follow up about our premium pet food products.\n\nBest,\nPrime Pet Food Team`;

    try {
      await resend.emails.send({
        from: FROM,
        to: lead.email,
        subject,
        text: body,
      });

      // Mark email as sent if it was a draft
      if (existingEmail && existingEmail.status === "DRAFT") {
        await prisma.outreachEmail.update({
          where: { id: existingEmail.id },
          data: { status: "SENT", sentAt: new Date() },
        });
      }

      const nextStep = currentStep + 1;
      const isComplete = nextStep > MAX_STEP;

      // Update sequence record
      await prisma.leadFollowUpSequence.update({
        where: { id: seq.id },
        data: {
          currentStep: isComplete ? currentStep : nextStep,
          status: isComplete ? "COMPLETED" : "ACTIVE",
          nextSendAt: isComplete ? null : nextSendAtForStep(nextStep),
          completedAt: isComplete ? new Date() : null,
        },
      });

      // Mark lead as contacted
      if (lead.status === "NEW") {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "CONTACTED", contactedAt: new Date() },
        });
      }

      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "SEQUENCE_EMAIL_SENT",
          title: `Sequence step ${currentStep} sent: "${subject}"`,
        },
      });

      sent++;
    } catch {
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "SEQUENCE_EMAIL_FAILED",
          title: `Sequence step ${currentStep} failed to send`,
        },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed: due.length, sent, failed });
}
