-- Add extended fields to Lead table
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadType" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "zip" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadScore" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "leadTemperature" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sellsDogTreats" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "sellsCompetitorProducts" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "contactedAt" TIMESTAMP(3);

-- OutreachEmail table
CREATE TABLE IF NOT EXISTS "OutreachEmail" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "leadId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "sequenceStep" INTEGER NOT NULL DEFAULT 1,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OutreachEmail_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OutreachEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "OutreachEmail_leadId_idx" ON "OutreachEmail"("leadId");

-- LeadActivity table
CREATE TABLE IF NOT EXISTS "LeadActivity" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "leadId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");

-- LeadDeal table
CREATE TABLE IF NOT EXISTS "LeadDeal" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "leadId" TEXT NOT NULL,
  "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "lossReason" TEXT,
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadDeal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadDeal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LeadDeal_leadId_idx" ON "LeadDeal"("leadId");

-- LeadSample table
CREATE TABLE IF NOT EXISTS "LeadSample" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "leadId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "trackingNumber" TEXT,
  "shippedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "feedback" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadSample_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadSample_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LeadSample_leadId_idx" ON "LeadSample"("leadId");

-- LeadFollowUpSequence table
CREATE TABLE IF NOT EXISTS "LeadFollowUpSequence" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "leadId" TEXT NOT NULL,
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "nextSendAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadFollowUpSequence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LeadFollowUpSequence_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "LeadFollowUpSequence_leadId_idx" ON "LeadFollowUpSequence"("leadId");
