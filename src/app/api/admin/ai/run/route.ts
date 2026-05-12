/**
 * POST /api/admin/ai/run
 * Manually trigger an AI agent run.
 */

import { NextRequest, NextResponse } from "next/server";
import "@/lib/ai/agents"; // ensure all agents are registered
import { runAgent } from "@/lib/ai/runner";
import type { AgentId } from "@/lib/ai/config";

const VALID_AGENTS: AgentId[] = [
  "lead_finder",
  "lead_qualifier",
  "outreach_drafter",
  "follow_up",
  "reorder_predictor",
  "churn_detector",
  "sales_copilot",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId } = body as { agentId: string };

    if (!agentId || !VALID_AGENTS.includes(agentId as AgentId)) {
      return NextResponse.json(
        { error: `Invalid agent ID. Valid agents: ${VALID_AGENTS.join(", ")}` },
        { status: 400 }
      );
    }

    const { runId, result } = await runAgent(agentId as AgentId, "admin");

    return NextResponse.json({
      runId,
      agentId,
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Agent run error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to run agent" },
      { status: 500 }
    );
  }
}
