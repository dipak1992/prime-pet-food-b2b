import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { Resend } from "resend";

const STEP_DELAYS = [0, 3, 4, 3, 7];
const MAX_STEP = STEP_DELAYS.length;
const DEFAULT_REORDER_ROLLOUT_LIMIT = 5;
const MAX_REORDER_ROLLOUT_LIMIT = 50;
const REORDER_HISTORY_LIMIT = 6;

const reorderCustomerInclude = {
  user: { select: { email: true, name: true } },
  orders: {
    orderBy: { createdAt: "desc" },
    take: REORDER_HISTORY_LIMIT,
    include: {
      items: {
        select: {
          productId: true,
          productTitleSnapshot: true,
          skuSnapshot: true,
          quantity: true,
          totalPrice: true,
        },
      },
    },
  },
} satisfies Prisma.CustomerInclude;

type ReorderCustomer = Prisma.CustomerGetPayload<{ include: typeof reorderCustomerInclude }>;

type ProductRecommendation = {
  title: string;
  sku: string;
  quantity: number;
};

type ReorderCandidate = {
  customer: ReorderCustomer;
  cadenceDays: number;
  daysSinceLastOrder: number;
  daysOverdue: number;
  lastOrderNumber: string;
  lastOrderDate: Date;
  products: ProductRecommendation[];
};

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

function getReorderRolloutLimit() {
  const raw = Number.parseInt(process.env.REORDER_REMINDER_ROLLOUT_LIMIT || "", 10);
  if (!Number.isFinite(raw)) return DEFAULT_REORDER_ROLLOUT_LIMIT;
  return Math.min(Math.max(raw, 0), MAX_REORDER_ROLLOUT_LIMIT);
}

function daysBetween(later: Date, earlier: Date) {
  return (later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24);
}

function calculateCadenceDays(orders: ReorderCustomer["orders"]) {
  if (orders.length < 2) return null;

  const intervals = orders
    .slice(0, -1)
    .map((order, index) => daysBetween(order.createdAt, orders[index + 1].createdAt))
    .filter((interval) => interval > 0);

  if (!intervals.length) return null;

  const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  return Math.round(Math.min(Math.max(average, 7), 180));
}

function getRecommendedProducts(orders: ReorderCustomer["orders"]): ProductRecommendation[] {
  const productMap = new Map<
    string,
    { title: string; sku: string; totalQuantity: number; ordersSeen: number; latestQuantity: number; revenue: number }
  >();

  for (const order of orders.slice(0, 3)) {
    for (const item of order.items) {
      const existing = productMap.get(item.productId);
      const quantity = item.quantity;
      const revenue = Number(item.totalPrice);

      if (existing) {
        existing.totalQuantity += quantity;
        existing.ordersSeen += 1;
        existing.revenue += revenue;
      } else {
        productMap.set(item.productId, {
          title: item.productTitleSnapshot,
          sku: item.skuSnapshot || "",
          totalQuantity: quantity,
          ordersSeen: 1,
          latestQuantity: quantity,
          revenue,
        });
      }
    }
  }

  return [...productMap.values()]
    .sort((a, b) => b.ordersSeen - a.ordersSeen || b.revenue - a.revenue)
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      sku: item.sku,
      quantity: Math.max(item.latestQuantity, Math.round(item.totalQuantity / item.ordersSeen)),
    }));
}

function productLines(products: ProductRecommendation[]) {
  return products
    .map((product) => {
      const sku = product.sku ? ` (${product.sku})` : "";
      return `${product.quantity} x ${product.title}${sku}`;
    })
    .join("\n");
}

function parseLastSent(value: string) {
  try {
    const parsed = JSON.parse(value) as { sentAt?: string };
    return parsed.sentAt ? new Date(parsed.sentAt) : null;
  } catch {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}

async function buildAiReorderCopy(candidate: ReorderCandidate) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const openai = new OpenAI({ apiKey });
  const products = productLines(candidate.products);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You write concise B2B wholesale reorder emails for Prime Pet Food. Return only valid JSON with subject and bodyText.",
        },
        {
          role: "user",
          content: `Write a friendly reorder reminder for a wholesale buyer.

Business: ${candidate.customer.businessName}
Business type: ${candidate.customer.businessType}
Last order: ${candidate.lastOrderNumber}
Days since last order: ${candidate.daysSinceLastOrder}
Typical reorder cadence: ${candidate.cadenceDays} days
Suggested products and quantities:
${products}

Rules:
- Subject must be 3-7 words.
- Body must be under 120 words.
- Mention that the reminder is based on their usual reorder timing.
- Include the suggested products and quantities naturally.
- Keep it practical and not pushy.
- End with a simple prompt to reorder in the portal.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}") as {
      subject?: unknown;
      bodyText?: unknown;
    };

    if (typeof result.subject !== "string" || typeof result.bodyText !== "string") {
      return null;
    }

    return {
      subject: result.subject.slice(0, 120),
      bodyText: result.bodyText.slice(0, 1200),
    };
  } catch (error) {
    console.error("Failed to generate AI reorder email:", error);
    return null;
  }
}

function fallbackReorderCopy(candidate: ReorderCandidate) {
  const products = productLines(candidate.products);
  return {
    subject: "Time to restock",
    bodyText: `Hi ${candidate.customer.businessName},\n\nBased on your usual ${candidate.cadenceDays}-day reorder cycle, you may be ready to restock the items from your last orders:\n\n${products}\n\nYou can reorder from the wholesale portal when you are ready.`,
  };
}

async function processReorderReminders() {
  const rolloutLimit = getReorderRolloutLimit();
  if (rolloutLimit === 0) {
    return { skipped: true, reason: "REORDER_REMINDER_ROLLOUT_LIMIT is 0" };
  }

  const now = new Date();
  const customers = await prisma.customer.findMany({
    where: { accountStatus: "APPROVED", orders: { some: {} } },
    include: reorderCustomerInclude,
  });

  const eligibleCandidates = customers
    .map((customer): ReorderCandidate | null => {
      const cadenceDays = calculateCadenceDays(customer.orders);
      const lastOrder = customer.orders[0];
      if (!cadenceDays || !lastOrder || !customer.user.email) return null;

      const daysSinceLastOrder = Math.floor(daysBetween(now, lastOrder.createdAt));
      const daysOverdue = daysSinceLastOrder - cadenceDays;
      const products = getRecommendedProducts(customer.orders);

      if (daysOverdue < 0 || !products.length) return null;

      return {
        customer,
        cadenceDays,
        daysSinceLastOrder,
        daysOverdue,
        lastOrderNumber: lastOrder.orderNumber,
        lastOrderDate: lastOrder.createdAt,
        products,
      };
    })
    .filter((candidate): candidate is ReorderCandidate => Boolean(candidate));

  const lastSentSettings = await prisma.setting.findMany({
    where: {
      key: {
        in: eligibleCandidates.map((candidate) => `reorder-reminder:last-sent:${candidate.customer.id}`),
      },
    },
  });
  const lastSentByCustomerId = new Map(
    lastSentSettings.map((setting) => [setting.key.replace("reorder-reminder:last-sent:", ""), parseLastSent(setting.value)])
  );

  const candidates = eligibleCandidates
    .filter((candidate) => {
      const lastSentAt = lastSentByCustomerId.get(candidate.customer.id);
      return !lastSentAt || lastSentAt < candidate.lastOrderDate;
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, rolloutLimit);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  let aiGenerated = 0;
  const results = [];

  for (const candidate of candidates) {
    const aiCopy = await buildAiReorderCopy(candidate);
    const copy = aiCopy ?? fallbackReorderCopy(candidate);
    if (aiCopy) aiGenerated++;

    try {
      const result = await sendEmail({
        to: candidate.customer.user.email,
        template: "reorder-reminder",
        variables: {
          businessName: candidate.customer.businessName,
          lastOrderNumber: candidate.lastOrderNumber,
          products: candidate.products.map((product) => product.title).join(", "),
          productLines: productLines(candidate.products),
          reorderUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/quick-order`,
          subject: copy.subject,
          bodyText: copy.bodyText,
        },
      });

      const emailSkipped = typeof result === "object" && result !== null && "skipped" in result;
      if (!emailSkipped) {
        await prisma.setting.upsert({
          where: { key: `reorder-reminder:last-sent:${candidate.customer.id}` },
          create: {
            key: `reorder-reminder:last-sent:${candidate.customer.id}`,
            value: JSON.stringify({ sentAt: now.toISOString(), lastOrderNumber: candidate.lastOrderNumber }),
          },
          update: {
            value: JSON.stringify({ sentAt: now.toISOString(), lastOrderNumber: candidate.lastOrderNumber }),
          },
        });
        sent++;
      } else {
        skipped++;
      }

      results.push({
        customerId: candidate.customer.id,
        email: candidate.customer.user.email,
        cadenceDays: candidate.cadenceDays,
        daysSinceLastOrder: candidate.daysSinceLastOrder,
        products: candidate.products,
        aiGenerated: Boolean(aiCopy),
        skipped: emailSkipped,
      });
    } catch (error) {
      failed++;
      results.push({
        customerId: candidate.customer.id,
        email: candidate.customer.user.email,
        error: error instanceof Error ? error.message : "Email failed",
      });
    }
  }

  return {
    rolloutLimit,
    eligible: eligibleCandidates.length,
    processed: candidates.length,
    sent,
    skipped,
    failed,
    aiGenerated,
    results,
  };
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

  const reorderReminders = await processReorderReminders();

  await prisma.setting.upsert({
    where: { key: settingKey },
    create: { key: settingKey, value: todayKey },
    update: { value: todayKey },
  });

  const leadAutomation = await processLeadFollowUps();

  return NextResponse.json({
    reorderReminders,
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
