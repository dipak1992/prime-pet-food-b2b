/**
 * GET /api/cron/ai-agents
 * Cron endpoint to run scheduled AI agents.
 * Designed to be called by Vercel Cron or similar scheduler.
 *
 * Checks each agent's schedule and runs those that are due.
 * Protected by CRON_SECRET environment variable.
 */

import { NextRequest, NextResponse } from "next/server";
import "@/lib/ai/agents"; // ensure all agents are registered
import { runAgent } from "@/lib/ai/runner";
import { getAiConfig, type AgentId } from "@/lib/ai/config";

/**
 * Simple cron schedule checker.
 * Checks if a cron expression matches the current time (hour + day-of-week).
 * Format: "minute hour day-of-month month day-of-week"
 */
function shouldRunNow(cronExpression: string): boolean {
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) return false;

  const [cronMin, cronHour, , , cronDow] = parts;
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentDow = now.getDay(); // 0=Sun, 1=Mon, ...

  // Check minute (allow within 5-minute window for cron flexibility)
  if (cronMin !== "*") {
    const targetMin = parseInt(cronMin, 10);
    if (Math.abs(currentMin - targetMin) > 5) return false;
  }

  // Check hour
  if (cronHour !== "*") {
    const targetHour = parseInt(cronHour, 10);
    if (currentHour !== targetHour) return false;
  }

  // Check day of week (cron uses 0-7 where 0 and 7 are Sunday)
  if (cronDow !== "*") {
    // Handle ranges like "1-5" (Mon-Fri)
    if (cronDow.includes("-")) {
      const [start, end] = cronDow.split("-").map(Number);
      if (currentDow < start || currentDow > end) return false;
    } else {
      const targetDow = parseInt(cronDow, 10);
      if (currentDow !== targetDow && !(targetDow === 7 && currentDow === 0)) {
        return false;
      }
    }
  }

  return true;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getAiConfig();

  if (!config.globalEnabled) {
    return NextResponse.json({
      message: "AI system is globally disabled",
      ran: [],
    });
  }

  const results: Array<{
    agentId: string;
    status: string;
    message: string;
    runId?: string;
  }> = [];

  // Check each agent
  const agentIds = Object.keys(config.agents) as AgentId[];

  for (const agentId of agentIds) {
    const agentConfig = config.agents[agentId];

    // Skip disabled agents
    if (!agentConfig.enabled) {
      continue;
    }

    // Skip agents without a schedule (like sales_copilot)
    if (!agentConfig.schedule) {
      continue;
    }

    // Check if it's time to run
    if (!shouldRunNow(agentConfig.schedule)) {
      continue;
    }

    try {
      const { runId, result } = await runAgent(agentId, "cron");
      results.push({
        agentId,
        status: result.success ? "completed" : "failed",
        message: result.message,
        runId,
      });
    } catch (error) {
      results.push({
        agentId,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    message: `Cron check complete. ${results.length} agent(s) ran.`,
    timestamp: new Date().toISOString(),
    ran: results,
  });
}
