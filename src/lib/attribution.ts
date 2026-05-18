import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TrackAttributionInput = {
  email?: string | null;
  businessName?: string | null;
  leadId?: string | null;
  customerId?: string | null;
  sessionId?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
  page?: string | null;
  eventType: string;
  metadata?: Prisma.InputJsonValue;
};

export async function trackAttributionEvent(input: TrackAttributionInput) {
  return prisma.attributionEvent.create({
    data: {
      email: input.email?.toLowerCase() || null,
      businessName: input.businessName || null,
      leadId: input.leadId || null,
      customerId: input.customerId || null,
      sessionId: input.sessionId || null,
      source: input.source || "direct",
      medium: input.medium || null,
      campaign: input.campaign || null,
      content: input.content || null,
      term: input.term || null,
      page: input.page || null,
      eventType: input.eventType,
      metadata: input.metadata,
    },
  });
}

export async function findRecentAttribution(params: {
  email?: string | null;
  businessName?: string | null;
  customerId?: string | null;
}) {
  return prisma.attributionEvent.findFirst({
    where: {
      OR: [
        params.email ? { email: params.email.toLowerCase() } : undefined,
        params.businessName ? { businessName: { equals: params.businessName, mode: "insensitive" } } : undefined,
        params.customerId ? { customerId: params.customerId } : undefined,
      ].filter(Boolean) as Array<Record<string, unknown>>,
    },
    orderBy: { createdAt: "desc" },
  });
}
