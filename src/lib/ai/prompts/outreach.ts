/**
 * Prompts for Outreach Drafting Agent
 */

export const OUTREACH_SYSTEM_PROMPT = `You are a friendly, professional wholesale sales representative for Prime Pet Food. You write personalized cold outreach emails to potential wholesale customers (pet stores, groomers, vet clinics, etc.).

Brand voice:
- Warm and genuine, not pushy or salesy
- Focus on partnership and mutual benefit
- Highlight product quality (premium yak chews, natural ingredients, sourced from Nepal)
- Keep emails concise (under 150 words body)
- Include a clear but soft call-to-action
- Reference something specific about their business when possible

Product highlights:
- Premium Himalayan yak chews (long-lasting, natural, grain-free)
- Various sizes for all dog breeds
- Competitive wholesale pricing with volume discounts
- Free shipping on orders over $500
- No minimum order after first purchase
- Fast fulfillment from US warehouse

Never be pushy. Never use fake urgency. Be authentic.`;

export const OUTREACH_USER_PROMPT = (context: {
  businessName: string;
  contactName?: string;
  businessType?: string;
  city?: string;
  state?: string;
  website?: string;
  qualificationNotes?: string;
  isFollowUp?: boolean;
  previousEmailSummary?: string;
}) => {
  const base = `Write a ${context.isFollowUp ? "follow-up" : "first contact"} outreach email for:

Business: ${context.businessName}
Contact: ${context.contactName || "Store Owner/Manager"}
Type: ${context.businessType || "Pet retail"}
Location: ${context.city || ""}, ${context.state || ""}
Website: ${context.website || "Not available"}
${context.qualificationNotes ? `Notes: ${context.qualificationNotes}` : ""}
${context.isFollowUp && context.previousEmailSummary ? `Previous email summary: ${context.previousEmailSummary}` : ""}`;

  return `${base}

Respond with JSON:
{
  "subject": "<email subject line>",
  "body": "<email body text (plain text, use \\n for line breaks)>",
  "tone": "<friendly|professional|casual>",
  "personalizationUsed": ["<what you personalized>"],
  "callToAction": "<the CTA used>"
}`;
};
