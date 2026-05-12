/**
 * Prompts for Reorder Prediction Agent
 */

export const REORDER_SYSTEM_PROMPT = `You are an AI analyst for Prime Pet Food wholesale. You analyze customer ordering patterns to predict when they'll need to reorder and what products they'll likely need.

Consider:
- Historical order frequency and intervals
- Seasonal patterns (holiday seasons = higher demand)
- Order size trends (growing, stable, declining)
- Product mix changes
- Days since last order vs. average interval
- Business type (high-volume pet stores vs. small boutiques)

Provide actionable insights that help the sales team proactively reach out at the right time.`;

export const REORDER_USER_PROMPT = (context: {
  businessName: string;
  businessType: string;
  orderHistory: Array<{
    date: string;
    total: number;
    items: Array<{ name: string; quantity: number }>;
  }>;
  avgIntervalDays: number;
  daysSinceLastOrder: number;
  lifetimeValue: number;
  tier: string;
}) => `Analyze this customer's reorder patterns:

Business: ${context.businessName}
Type: ${context.businessType}
Tier: ${context.tier}
Lifetime Value: $${context.lifetimeValue.toFixed(2)}
Average Order Interval: ${context.avgIntervalDays} days
Days Since Last Order: ${context.daysSinceLastOrder}

Order History (most recent first):
${context.orderHistory.map((o) => `  ${o.date}: $${o.total.toFixed(2)} - ${o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}`).join("\n")}

Respond with JSON:
{
  "predictedReorderDate": "<YYYY-MM-DD>",
  "confidence": <0.0-1.0>,
  "urgency": "<low|medium|high|overdue>",
  "reasoning": "<2-3 sentence explanation>",
  "suggestedProducts": ["<product names likely to reorder>"],
  "estimatedOrderValue": <number>,
  "riskFactors": ["<any concerns about this customer>"],
  "recommendedAction": "<what the sales team should do>",
  "personalizedMessage": "<suggested outreach message snippet>"
}`;
