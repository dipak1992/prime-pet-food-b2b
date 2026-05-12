/**
 * AI Safety Controls
 * Rate limiting, deduplication, business hours enforcement, compliance checks.
 */

import { prisma } from "@/lib/prisma";
import { getAiConfig, isWithinBusinessHours } from "./config";
import type { AgentId } from "./config";

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if an agent run is allowed based on safety limits.
 */
export async function checkAgentSafety(agentId: AgentId): Promise<SafetyCheckResult> {
  const config = getAiConfig();

  // Global kill switch
  if (!config.globalEnabled) {
    return { allowed: false, reason: "AI system is globally disabled" };
  }

  // Agent-specific check
  const agentConfig = config.agents[agentId];
  if (!agentConfig?.enabled) {
    return { allowed: false, reason: `Agent ${agentId} is disabled` };
  }

  // Business hours check
  if (config.safetyLimits.businessHoursOnly && !isWithinBusinessHours()) {
    return { allowed: false, reason: "Outside business hours" };
  }

  // Daily run limit check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const runsToday = await prisma.aiRun.count({
    where: {
      agentId,
      startedAt: { gte: today },
    },
  });

  if (runsToday >= agentConfig.maxRunsPerDay) {
    return { allowed: false, reason: `Daily run limit reached (${runsToday}/${agentConfig.maxRunsPerDay})` };
  }

  return { allowed: true };
}

/**
 * Check if we can send more emails today.
 */
export async function checkEmailLimit(): Promise<SafetyCheckResult> {
  const config = getAiConfig();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const emailsSentToday = await prisma.aiRun.count({
    where: {
      agentId: { in: ["outreach_drafter", "follow_up", "reorder_predictor"] },
      startedAt: { gte: today },
      status: "completed",
      metadata: { path: ["emailSent"], equals: true },
    },
  });

  if (emailsSentToday >= config.safetyLimits.maxEmailsPerDay) {
    return { allowed: false, reason: `Daily email limit reached (${emailsSentToday}/${config.safetyLimits.maxEmailsPerDay})` };
  }

  return { allowed: true };
}

/**
 * Check for duplicate outreach to the same lead/email within the dedup window.
 */
export async function checkDeduplication(email: string, agentId: AgentId): Promise<SafetyCheckResult> {
  const config = getAiConfig();
  const windowStart = new Date();
  windowStart.setHours(windowStart.getHours() - config.safetyLimits.deduplicationWindowHours);

  const recentRun = await prisma.aiRun.findFirst({
    where: {
      agentId,
      startedAt: { gte: windowStart },
      status: "completed",
      metadata: { path: ["targetEmail"], equals: email },
    },
  });

  if (recentRun) {
    return {
      allowed: false,
      reason: `Duplicate: already contacted ${email} within ${config.safetyLimits.deduplicationWindowHours}h window`,
    };
  }

  return { allowed: true };
}

/**
 * Combined safety check for email-sending agents.
 */
export async function checkEmailSafety(agentId: AgentId, targetEmail: string): Promise<SafetyCheckResult> {
  const agentCheck = await checkAgentSafety(agentId);
  if (!agentCheck.allowed) return agentCheck;

  const emailCheck = await checkEmailLimit();
  if (!emailCheck.allowed) return emailCheck;

  const dedupCheck = await checkDeduplication(targetEmail, agentId);
  if (!dedupCheck.allowed) return dedupCheck;

  return { allowed: true };
}
