CREATE TYPE "QuoteStage" AS ENUM (
  'NEW',
  'QUALIFYING',
  'SAMPLE_SENT',
  'QUOTE_DRAFTED',
  'QUOTE_SENT',
  'NEGOTIATION',
  'WON',
  'LOST'
);

ALTER TABLE "SupportRequest"
  ADD COLUMN "dueAt" TIMESTAMP(3),
  ADD COLUMN "slaBreachedAt" TIMESTAMP(3);

CREATE TABLE "QuoteRequest" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "supportRequestId" TEXT,
  "stage" "QuoteStage" NOT NULL DEFAULT 'NEW',
  "requestType" TEXT NOT NULL,
  "expectedVolume" TEXT,
  "targetSkus" TEXT,
  "timeline" TEXT,
  "shippingZip" TEXT,
  "estimatedValue" DECIMAL(12,2),
  "lossReason" TEXT,
  "nextFollowUpAt" TIMESTAMP(3),
  "dueAt" TIMESTAMP(3),
  "assignedToId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuoteRequest_supportRequestId_key" ON "QuoteRequest"("supportRequestId");
CREATE INDEX "QuoteRequest_customerId_idx" ON "QuoteRequest"("customerId");
CREATE INDEX "QuoteRequest_stage_idx" ON "QuoteRequest"("stage");
CREATE INDEX "QuoteRequest_dueAt_idx" ON "QuoteRequest"("dueAt");

ALTER TABLE "QuoteRequest"
  ADD CONSTRAINT "QuoteRequest_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "QuoteRequest"
  ADD CONSTRAINT "QuoteRequest_supportRequestId_fkey"
  FOREIGN KEY ("supportRequestId") REFERENCES "SupportRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AttributionEvent" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "businessName" TEXT,
  "leadId" TEXT,
  "customerId" TEXT,
  "sessionId" TEXT,
  "source" TEXT NOT NULL,
  "medium" TEXT,
  "campaign" TEXT,
  "content" TEXT,
  "term" TEXT,
  "page" TEXT,
  "eventType" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AttributionEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AttributionEvent_email_idx" ON "AttributionEvent"("email");
CREATE INDEX "AttributionEvent_leadId_idx" ON "AttributionEvent"("leadId");
CREATE INDEX "AttributionEvent_customerId_idx" ON "AttributionEvent"("customerId");
CREATE INDEX "AttributionEvent_source_idx" ON "AttributionEvent"("source");
CREATE INDEX "AttributionEvent_eventType_idx" ON "AttributionEvent"("eventType");

ALTER TABLE "AttributionEvent"
  ADD CONSTRAINT "AttributionEvent_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AttributionEvent"
  ADD CONSTRAINT "AttributionEvent_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "SlaRule" (
  "id" TEXT NOT NULL,
  "workflow" TEXT NOT NULL,
  "priority" TEXT,
  "requestType" TEXT,
  "hours" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SlaRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SlaRule_workflow_idx" ON "SlaRule"("workflow");
CREATE INDEX "SlaRule_requestType_idx" ON "SlaRule"("requestType");
CREATE INDEX "SlaRule_isActive_idx" ON "SlaRule"("isActive");

INSERT INTO "SlaRule" ("id", "workflow", "requestType", "hours", "isActive", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'APPLICATION_REVIEW', NULL, 24, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'QUOTE_REQUEST', 'CUSTOM_PRICING', 24, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'QUOTE_REQUEST', 'SAMPLE_REQUEST', 48, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'QUOTE_REQUEST', 'SALES_REP', 24, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'ORDER_INVOICE', NULL, 4, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'TRACKING_UPDATE', NULL, 24, true, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'OVERDUE_INVOICE_FOLLOWUP', NULL, 72, true, CURRENT_TIMESTAMP);
