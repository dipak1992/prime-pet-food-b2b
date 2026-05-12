/**
 * Reorder Predictor Agent
 * Analyzes customer ordering patterns to predict when they'll need to reorder.
 * Creates ReorderPrediction records for admin review.
 */

import { prisma } from "@/lib/prisma";
import { llmJson } from "../llm";
import { REORDER_SYSTEM_PROMPT, REORDER_USER_PROMPT } from "../prompts/reorder";
import { registerAgent, type AgentContext, type AgentRunResult } from "../runner";

interface ReorderAnalysis {
  predictedReorderDate: string;
  confidence: number;
  urgency: "low" | "medium" | "high" | "overdue";
  reasoning: string;
  suggestedProducts: string[];
  estimatedOrderValue: number;
  riskFactors: string[];
  recommendedAction: string;
  personalizedMessage: string;
}

async function reorderPredictorAgent(context: AgentContext): Promise<AgentRunResult> {
  // Find active customers with at least 2 orders (need history to predict)
  const customers = await prisma.customer.findMany({
    where: {
      accountStatus: "APPROVED",
      orders: {
        some: {
          status: { in: ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] },
        },
      },
    },
    include: {
      user: { select: { email: true } },
      orders: {
        where: {
          status: { in: ["CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"] },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            include: {
              product: { select: { title: true } },
            },
          },
        },
      },
    },
    take: 15,
  });

  // Filter to customers with 2+ orders
  const eligibleCustomers = customers.filter((c) => c.orders.length >= 2);

  if (eligibleCustomers.length === 0) {
    return {
      success: true,
      message: "No customers with enough order history for prediction",
      data: { processed: 0 },
    };
  }

  let predictionsCreated = 0;
  const results: Array<{ customer: string; urgency: string; predictedDate: string }> = [];

  for (const customer of eligibleCustomers) {
    try {
      // Skip if we already have a recent pending prediction for this customer
      const existingPrediction = await prisma.reorderPrediction.findFirst({
        where: {
          customerId: customer.id,
          status: "pending",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // within 7 days
        },
      });
      if (existingPrediction) continue;

      // Calculate order intervals
      const orderDates = customer.orders.map((o) => new Date(o.createdAt).getTime());
      const intervals: number[] = [];
      for (let i = 0; i < orderDates.length - 1; i++) {
        intervals.push(Math.floor((orderDates[i] - orderDates[i + 1]) / (1000 * 60 * 60 * 24)));
      }
      const avgIntervalDays = intervals.length > 0
        ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
        : 30;

      const lastOrder = customer.orders[0];
      const daysSinceLastOrder = Math.floor(
        (Date.now() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate lifetime value
      const lifetimeValue = customer.orders.reduce(
        (sum, o) => sum + Number(o.grandTotal),
        0
      );

      const orderHistory = customer.orders.slice(0, 5).map((o) => ({
        date: new Date(o.createdAt).toLocaleDateString(),
        total: Number(o.grandTotal),
        items: o.items.map((item) => ({
          name: item.product?.title || item.productTitleSnapshot,
          quantity: item.quantity,
        })),
      }));

      const analysis = await llmJson<ReorderAnalysis>(
        REORDER_SYSTEM_PROMPT,
        REORDER_USER_PROMPT({
          businessName: customer.businessName,
          businessType: customer.businessType,
          orderHistory,
          avgIntervalDays,
          daysSinceLastOrder,
          lifetimeValue,
          tier: customer.tier,
        }),
        { temperature: 0.5 }
      );

      // Create prediction record
      await prisma.reorderPrediction.create({
        data: {
          customerId: customer.id,
          predictedDate: new Date(analysis.predictedReorderDate),
          confidence: Math.min(1, Math.max(0, analysis.confidence)),
          reasoning: analysis.reasoning,
          suggestedProducts: analysis.suggestedProducts,
          estimatedOrderValue: analysis.estimatedOrderValue,
          status: "pending",
          aiRunId: context.runId,
        },
      });

      predictionsCreated++;
      results.push({
        customer: customer.businessName,
        urgency: analysis.urgency,
        predictedDate: analysis.predictedReorderDate,
      });
    } catch (error) {
      console.error(`Reorder prediction failed for ${customer.businessName}:`, error);
    }
  }

  return {
    success: true,
    message: `Generated ${predictionsCreated} reorder predictions`,
    data: {
      processed: eligibleCustomers.length,
      predictionsCreated,
      results,
    },
    recommendations: predictionsCreated > 0
      ? [
          {
            type: "reorder_prediction",
            title: `${predictionsCreated} reorder opportunities identified`,
            description: `AI has identified ${predictionsCreated} customers likely to reorder soon. Review predictions and send reminders.`,
            priority: "medium" as const,
            actionUrl: "/admin/ai/reorders",
            metadata: { results },
          },
        ]
      : [],
  };
}

// Register the agent
registerAgent("reorder_predictor", reorderPredictorAgent);

export { reorderPredictorAgent };
