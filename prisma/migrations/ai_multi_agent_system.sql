-- ─────────────────────────────────────────────────────────────────────────────
-- AI Multi-Agent System Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── AiRun ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AiRun" (
  "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "agentId"      TEXT        NOT NULL,
  "status"       TEXT        NOT NULL DEFAULT 'running',
  "triggeredBy"  TEXT        NOT NULL DEFAULT 'system',
  "startedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  "completedAt"  TIMESTAMPTZ,
  "error"        TEXT,
  "result"       JSONB,
  "metadata"     JSONB,
  "tokensUsed"   INTEGER     NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AiRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AiRun_agentId_idx"   ON "AiRun" ("agentId");
CREATE INDEX IF NOT EXISTS "AiRun_status_idx"    ON "AiRun" ("status");
CREATE INDEX IF NOT EXISTS "AiRun_startedAt_idx" ON "AiRun" ("startedAt");

-- ── AiRecommendation ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AiRecommendation" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "aiRunId"     TEXT        NOT NULL,
  "agentId"     TEXT        NOT NULL,
  "type"        TEXT        NOT NULL,
  "title"       TEXT        NOT NULL,
  "description" TEXT        NOT NULL,
  "priority"    TEXT        NOT NULL DEFAULT 'medium',
  "status"      TEXT        NOT NULL DEFAULT 'pending',
  "actionUrl"   TEXT,
  "metadata"    JSONB,
  "reviewedBy"  TEXT,
  "reviewedAt"  TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AiRecommendation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AiRecommendation_aiRunId_fkey"
    FOREIGN KEY ("aiRunId") REFERENCES "AiRun" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "AiRecommendation_agentId_idx" ON "AiRecommendation" ("agentId");
CREATE INDEX IF NOT EXISTS "AiRecommendation_status_idx"  ON "AiRecommendation" ("status");
CREATE INDEX IF NOT EXISTS "AiRecommendation_priority_idx" ON "AiRecommendation" ("priority");

-- ── FollowUpTask ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "FollowUpTask" (
  "id"            TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "leadId"        TEXT,
  "customerId"    TEXT,
  "type"          TEXT        NOT NULL,
  "status"        TEXT        NOT NULL DEFAULT 'pending',
  "scheduledFor"  TIMESTAMPTZ NOT NULL,
  "subject"       TEXT,
  "draftContent"  TEXT,
  "finalContent"  TEXT,
  "approvedBy"    TEXT,
  "approvedAt"    TIMESTAMPTZ,
  "sentAt"        TIMESTAMPTZ,
  "metadata"      JSONB,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "FollowUpTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FollowUpTask_status_idx"       ON "FollowUpTask" ("status");
CREATE INDEX IF NOT EXISTS "FollowUpTask_scheduledFor_idx" ON "FollowUpTask" ("scheduledFor");
CREATE INDEX IF NOT EXISTS "FollowUpTask_leadId_idx"       ON "FollowUpTask" ("leadId");
CREATE INDEX IF NOT EXISTS "FollowUpTask_customerId_idx"   ON "FollowUpTask" ("customerId");

-- ── ReorderPrediction ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ReorderPrediction" (
  "id"                  TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "customerId"          TEXT        NOT NULL,
  "predictedDate"       TIMESTAMPTZ NOT NULL,
  "confidence"          DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "reasoning"           TEXT,
  "suggestedProducts"   JSONB,
  "estimatedOrderValue" DOUBLE PRECISION,
  "status"              TEXT        NOT NULL DEFAULT 'pending',
  "notifiedAt"          TIMESTAMPTZ,
  "orderedAt"           TIMESTAMPTZ,
  "aiRunId"             TEXT,
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "ReorderPrediction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReorderPrediction_customerId_idx"    ON "ReorderPrediction" ("customerId");
CREATE INDEX IF NOT EXISTS "ReorderPrediction_predictedDate_idx" ON "ReorderPrediction" ("predictedDate");
CREATE INDEX IF NOT EXISTS "ReorderPrediction_status_idx"        ON "ReorderPrediction" ("status");

-- ── AiAgentConfig ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AiAgentConfig" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "agentId"     TEXT        NOT NULL,
  "name"        TEXT        NOT NULL,
  "description" TEXT,
  "enabled"     BOOLEAN     NOT NULL DEFAULT false,
  "schedule"    TEXT,
  "config"      JSONB,
  "lastRunAt"   TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "AiAgentConfig_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "AiAgentConfig_agentId_key" UNIQUE ("agentId")
);
