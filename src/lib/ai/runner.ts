/**
 * Agent Runner - Execution engine for AI agents.
 * Handles logging, error handling, and lifecycle management.
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { checkAgentSafety } from "./safety";
import type { AgentId } from "./config";

export type AgentStatus = "running" | "completed" | "failed" | "skipped";

export interface AgentRunResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  recommendations?: Array<{
    type: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    actionUrl?: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface AgentContext {
  runId: string;
  agentId: AgentId;
  triggeredBy: string;
  startedAt: Date;
}

type AgentFunction = (context: AgentContext) => Promise<AgentRunResult>;

const agentRegistry: Map<AgentId, AgentFunction> = new Map();

/**
 * Register an agent function.
 */
export function registerAgent(agentId: AgentId, fn: AgentFunction) {
  agentRegistry.set(agentId, fn);
}

/**
 * Execute an agent with full lifecycle management.
 */
export async function runAgent(
  agentId: AgentId,
  triggeredBy: string = "system"
): Promise<{ runId: string; result: AgentRunResult }> {
  // Safety check
  const safety = await checkAgentSafety(agentId);
  if (!safety.allowed) {
    // Log skipped run
    const run = await prisma.aiRun.create({
      data: {
        agentId,
        status: "skipped",
        triggeredBy,
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: { skipReason: safety.reason },
      },
    });
    return {
      runId: run.id,
      result: { success: false, message: safety.reason || "Safety check failed" },
    };
  }

  // Create run record
  const run = await prisma.aiRun.create({
    data: {
      agentId,
      status: "running",
      triggeredBy,
      startedAt: new Date(),
    },
  });

  await prisma.aiAgentConfig.updateMany({
    where: { agentId },
    data: { lastRunAt: run.startedAt },
  });

  const context: AgentContext = {
    runId: run.id,
    agentId,
    triggeredBy,
    startedAt: run.startedAt,
  };

  try {
    const agentFn = agentRegistry.get(agentId);
    if (!agentFn) {
      throw new Error(`Agent ${agentId} not registered`);
    }

    const result = await agentFn(context);

    // Save recommendations if any
    if (result.recommendations?.length) {
      await prisma.aiRecommendation.createMany({
        data: result.recommendations.map((rec) => ({
          aiRunId: run.id,
          agentId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          actionUrl: rec.actionUrl,
          metadata: (rec.metadata ?? {}) as Prisma.InputJsonValue,
          status: "pending",
        })),
      });
    }

    // Update run as completed
    await prisma.aiRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        result: (result.data ?? {}) as Prisma.InputJsonValue,
        metadata: { message: result.message } as Prisma.InputJsonValue,
        tokensUsed: (result.data?.tokensUsed as number) || 0,
      },
    });

    return { runId: run.id, result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Update run as failed
    await prisma.aiRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: errorMessage,
      },
    });

    return {
      runId: run.id,
      result: { success: false, message: errorMessage },
    };
  }
}

/**
 * Get recent runs for an agent.
 */
export async function getAgentRuns(agentId?: AgentId, limit: number = 20) {
  return prisma.aiRun.findMany({
    where: agentId ? { agentId } : undefined,
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

/**
 * Get pending recommendations.
 */
export async function getPendingRecommendations(agentId?: AgentId) {
  return prisma.aiRecommendation.findMany({
    where: {
      status: "pending",
      ...(agentId ? { agentId } : {}),
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: { aiRun: true },
  });
}
