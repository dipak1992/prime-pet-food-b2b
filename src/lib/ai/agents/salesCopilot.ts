/**
 * Sales Copilot Agent
 * Interactive chat assistant that queries business data and provides insights.
 * Unlike other agents, this is invoked on-demand via the chat interface.
 */

import { prisma } from "@/lib/prisma";
import { llmPrompt } from "../llm";
import { COPILOT_SYSTEM_PROMPT, COPILOT_USER_PROMPT } from "../prompts/copilot";
import { registerAgent, type AgentContext, type AgentRunResult } from "../runner";

/**
 * Gather business context for the copilot.
 */
async function gatherBusinessContext() {
  const [
    totalCustomers,
    totalOrders,
    activeLeads,
    pendingFollowUps,
    pendingPredictions,
    recentOrders,
    topCustomers,
  ] = await Promise.all([
    prisma.customer.count({ where: { accountStatus: "APPROVED" } }),
    prisma.order.count(),
    prisma.lead.count({ where: { status: { in: ["NEW", "CONTACTED", "QUALIFIED"] } } }),
    prisma.followUpTask.count({ where: { status: "pending" } }),
    prisma.reorderPrediction.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { businessName: true } } },
    }),
    prisma.customer.findMany({
      take: 5,
      where: { accountStatus: "APPROVED" },
      include: {
        orders: {
          select: { grandTotal: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
  ]);

  // Calculate total revenue
  const allOrders = await prisma.order.aggregate({
    _sum: { grandTotal: true },
  });
  const totalRevenue = Number(allOrders._sum.grandTotal || 0);

  // Format recent orders
  const formattedRecentOrders = recentOrders.map((o) => ({
    customer: o.customer.businessName,
    amount: Number(o.grandTotal),
    date: new Date(o.createdAt).toLocaleDateString(),
  }));

  // Format top customers by LTV
  const formattedTopCustomers = topCustomers
    .map((c) => {
      const ltv = c.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
      const lastOrder = c.orders[0];
      return {
        name: c.businessName,
        ltv,
        lastOrder: lastOrder
          ? new Date(lastOrder.createdAt).toLocaleDateString()
          : "Never",
      };
    })
    .sort((a, b) => b.ltv - a.ltv);

  return {
    totalCustomers,
    totalOrders,
    totalRevenue,
    activeLeads,
    recentOrders: formattedRecentOrders,
    topCustomers: formattedTopCustomers,
    pendingFollowUps,
    reorderOpportunities: pendingPredictions,
  };
}

/**
 * Handle a copilot chat query (called directly, not through the agent runner).
 */
export async function handleCopilotQuery(query: string): Promise<string> {
  const businessContext = await gatherBusinessContext();

  const response = await llmPrompt(
    COPILOT_SYSTEM_PROMPT,
    COPILOT_USER_PROMPT({ query, businessContext }),
    { temperature: 0.7 }
  );

  return response;
}

/**
 * Agent runner function (for scheduled/manual runs via the agent system).
 * Generates a daily summary.
 */
async function salesCopilotAgent(context: AgentContext): Promise<AgentRunResult> {
  const summary = await handleCopilotQuery(
    "Give me a comprehensive daily summary of the business: key metrics, notable changes, urgent items, and recommended actions for today."
  );

  return {
    success: true,
    message: "Daily summary generated",
    data: {
      summary,
      generatedAt: new Date().toISOString(),
    },
    recommendations: [
      {
        type: "daily_summary",
        title: "Daily Business Summary",
        description: summary.slice(0, 500),
        priority: "low" as const,
        actionUrl: "/admin/ai/copilot",
      },
    ],
  };
}

// Register the agent
registerAgent("sales_copilot", salesCopilotAgent);

export { salesCopilotAgent };
