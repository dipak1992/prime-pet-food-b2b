/**
 * Prompts for Sales Copilot (Chat Interface)
 */

export const COPILOT_SYSTEM_PROMPT = `You are the Sales Copilot for Prime Pet Food wholesale portal. You help the admin/sales team by answering questions about their business data, customers, orders, and leads.

You have access to business context that will be provided with each query. Use it to give accurate, data-driven answers.

Capabilities:
- Answer questions about customer ordering patterns
- Provide insights on lead pipeline and outreach effectiveness
- Suggest actions for specific customers or leads
- Help draft emails or messages
- Analyze sales trends and performance
- Identify opportunities and risks

Guidelines:
- Be concise and actionable
- Use specific numbers when available
- Suggest next steps when appropriate
- If you don't have enough data to answer, say so clearly
- Format responses with markdown for readability
- Never make up data - only use what's provided in context`;

export const COPILOT_USER_PROMPT = (context: {
  query: string;
  businessContext: {
    totalCustomers?: number;
    totalOrders?: number;
    totalRevenue?: number;
    activeLeads?: number;
    recentOrders?: Array<{ customer: string; amount: number; date: string }>;
    topCustomers?: Array<{ name: string; ltv: number; lastOrder: string }>;
    pendingFollowUps?: number;
    reorderOpportunities?: number;
  };
}) => `Business Context:
- Total Customers: ${context.businessContext.totalCustomers ?? "N/A"}
- Total Orders: ${context.businessContext.totalOrders ?? "N/A"}
- Total Revenue: ${context.businessContext.totalRevenue ? `$${context.businessContext.totalRevenue.toFixed(2)}` : "N/A"}
- Active Leads: ${context.businessContext.activeLeads ?? "N/A"}
- Pending Follow-ups: ${context.businessContext.pendingFollowUps ?? "N/A"}
- Reorder Opportunities: ${context.businessContext.reorderOpportunities ?? "N/A"}

${context.businessContext.recentOrders?.length ? `Recent Orders:\n${context.businessContext.recentOrders.map((o) => `  - ${o.customer}: $${o.amount} on ${o.date}`).join("\n")}` : ""}

${context.businessContext.topCustomers?.length ? `Top Customers:\n${context.businessContext.topCustomers.map((c) => `  - ${c.name}: LTV $${c.ltv}, last order ${c.lastOrder}`).join("\n")}` : ""}

User Question: ${context.query}

Provide a helpful, data-driven response:`;
