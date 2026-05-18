import { prisma } from "@/lib/prisma";

const DEFAULT_SLA_HOURS: Record<string, number> = {
  APPLICATION_REVIEW: 24,
  QUOTE_REQUEST: 24,
  SAMPLE_REQUEST: 48,
  CUSTOM_PRICING: 24,
  SALES_REP: 24,
  ORDER_INVOICE: 4,
  TRACKING_UPDATE: 24,
  OVERDUE_INVOICE_FOLLOWUP: 72,
};

export async function getSlaHours(workflow: string, requestType?: string | null, priority?: string | null) {
  const rule = await prisma.slaRule.findFirst({
    where: {
      workflow,
      isActive: true,
      OR: [
        { requestType: requestType || null, priority: priority || null },
        { requestType: requestType || null, priority: null },
        { requestType: null, priority: priority || null },
        { requestType: null, priority: null },
      ],
    },
    orderBy: [{ requestType: "desc" }, { priority: "desc" }, { updatedAt: "desc" }],
  });

  return rule?.hours ?? DEFAULT_SLA_HOURS[requestType || ""] ?? DEFAULT_SLA_HOURS[workflow] ?? 24;
}

export async function calculateDueAt(workflow: string, requestType?: string | null, priority?: string | null) {
  const hours = await getSlaHours(workflow, requestType, priority);
  const dueAt = new Date();
  dueAt.setHours(dueAt.getHours() + hours);
  return dueAt;
}

export function getSlaState(dueAt: Date | string | null | undefined, status?: string) {
  if (status === "RESOLVED" || status === "CLOSED" || status === "WON" || status === "LOST") {
    return "DONE";
  }
  if (!dueAt) return "UNTRACKED";
  const due = new Date(dueAt).getTime();
  const now = Date.now();
  if (due < now) return "OVERDUE";
  if (due - now <= 6 * 60 * 60 * 1000) return "DUE_SOON";
  return "ON_TRACK";
}
