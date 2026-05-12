/**
 * POST /api/admin/ai/copilot
 * Handle Sales Copilot chat queries.
 */

import { NextRequest, NextResponse } from "next/server";
import { handleCopilotQuery } from "@/lib/ai/agents/salesCopilot";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body as { message: string };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await handleCopilotQuery(message);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Copilot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get copilot response" },
      { status: 500 }
    );
  }
}
