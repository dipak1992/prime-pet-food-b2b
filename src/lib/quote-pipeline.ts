import type { QuoteStage } from "@prisma/client";

export function extractSupportField(message: string, label: string) {
  const line = message.split("\n").find((entry) => entry.toLowerCase().startsWith(label.toLowerCase()));
  return line?.split(":").slice(1).join(":").trim() || "";
}

export function isQuotePipelineRequest(requestType: string) {
  const normalized = requestType.toUpperCase();
  return (
    normalized === "SAMPLE_REQUEST" ||
    normalized === "CUSTOM_PRICING" ||
    normalized === "SALES_REP" ||
    normalized === "DISTRIBUTOR" ||
    normalized === "PRIVATE_LABEL"
  );
}

export function normalizeQuoteStage(value: unknown): QuoteStage | null {
  const allowed: QuoteStage[] = [
    "NEW",
    "QUALIFYING",
    "SAMPLE_SENT",
    "QUOTE_DRAFTED",
    "QUOTE_SENT",
    "NEGOTIATION",
    "WON",
    "LOST",
  ];
  return allowed.includes(value as QuoteStage) ? (value as QuoteStage) : null;
}

export async function buildQuoteRequestData(input: {
  customerId: string;
  supportRequestId?: string;
  requestType: string;
  message: string;
  dueAt?: Date;
  assignedToId?: string | null;
}) {
  const requestType = extractSupportField(input.message, "Request type") || input.requestType;

  return {
    customerId: input.customerId,
    supportRequestId: input.supportRequestId,
    stage: "NEW" as const,
    requestType,
    expectedVolume: extractSupportField(input.message, "Expected monthly volume") || null,
    targetSkus: extractSupportField(input.message, "Target SKUs / products") || null,
    timeline: extractSupportField(input.message, "Timeline") || null,
    shippingZip: extractSupportField(input.message, "Shipping ZIP") || null,
    dueAt: input.dueAt,
    assignedToId: input.assignedToId || null,
  };
}
