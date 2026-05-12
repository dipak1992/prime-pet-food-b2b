/**
 * GET   /api/admin/ai/settings  – Get AI configuration and agent statuses
 * PATCH /api/admin/ai/settings  – Toggle agent enabled/disabled
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAiConfig, type AgentId } from "@/lib/ai/config";

export async function GET() {
  try {
    const config = getAiConfig();

    // Get agent configs from database (or fall back to defaults)
    const dbAgentConfigs = await prisma.aiAgentConfig.findMany();
    const dbConfigMap = new Map(dbAgentConfigs.map((c) => [c.agentId, c]));

    // Merge database overrides with default config
    const agents = Object.values(config.agents).map((agent) => {
      const dbConfig = dbConfigMap.get(agent.id);
      return {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        enabled: dbConfig ? dbConfig.enabled : agent.enabled,
        schedule: agent.schedule ?? null,
        maxRunsPerDay: agent.maxRunsPerDay,
        requiresApproval: agent.requiresApproval,
        lastRunAt: dbConfig?.lastRunAt ?? null,
      };
    });

    // Get today's run counts grouped by agent and status
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const runsToday = await prisma.aiRun.groupBy({
      by: ["agentId", "status"],
      where: { startedAt: { gte: today } },
      _count: true,
    });

    const totalRunsToday = await prisma.aiRun.count({
      where: { startedAt: { gte: today } },
    });

    return NextResponse.json({
      config: {
        globalEnabled: config.globalEnabled,
        provider: config.provider,
        model: config.model,
        maxEmailsPerDay: config.safetyLimits.maxEmailsPerDay,
        businessHoursOnly: config.safetyLimits.businessHoursOnly,
        dedupWindowHours: config.safetyLimits.deduplicationWindowHours,
        safetyLimits: config.safetyLimits,
      },
      agents,
      runsToday,
      totalRunsToday,
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, enabled } = body as {
      agentId: string;
      enabled: boolean;
    };

    if (!agentId || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "agentId and enabled (boolean) are required" },
        { status: 400 }
      );
    }

    const config = getAiConfig();
    const agentConfig = config.agents[agentId as AgentId];

    if (!agentConfig) {
      return NextResponse.json(
        { error: `Unknown agent: ${agentId}` },
        { status: 400 }
      );
    }

    // Upsert the agent config in the database
    await prisma.aiAgentConfig.upsert({
      where: { agentId },
      update: { enabled },
      create: {
        agentId,
        name: agentConfig.name,
        description: agentConfig.description,
        enabled,
        schedule: agentConfig.schedule,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Agent ${agentId} ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Failed to update AI settings" },
      { status: 500 }
    );
  }
}
