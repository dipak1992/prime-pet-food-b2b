/**
 * Prompts for Reply Analysis (used by Follow-Up Agent)
 */

export const REPLY_ANALYSIS_SYSTEM_PROMPT = `You analyze email replies from potential wholesale customers to determine their intent and suggest next actions.

Categories of replies:
- POSITIVE: Interested, wants more info, asks about pricing/samples
- NEUTRAL: Acknowledges but non-committal, asks to contact later
- NEGATIVE: Not interested, already has supplier, wrong fit
- OUT_OF_OFFICE: Auto-reply, vacation notice
- UNSUBSCRIBE: Wants to be removed from outreach

Always be conservative - if unsure, categorize as NEUTRAL rather than POSITIVE.`;

export const REPLY_ANALYSIS_USER_PROMPT = (context: {
  originalSubject: string;
  originalBody: string;
  replyBody: string;
  businessName: string;
}) => `Analyze this reply to our outreach email:

Original subject: ${context.originalSubject}
Original email summary: ${context.originalBody.slice(0, 200)}...

Their reply:
---
${context.replyBody}
---

Business: ${context.businessName}

Respond with JSON:
{
  "sentiment": "<POSITIVE|NEUTRAL|NEGATIVE|OUT_OF_OFFICE|UNSUBSCRIBE>",
  "confidence": <0.0-1.0>,
  "summary": "<1-2 sentence summary of their response>",
  "keyPoints": ["<extracted key points>"],
  "suggestedAction": "<what to do next>",
  "suggestedReply": "<draft reply if appropriate, null if not>",
  "leadStatusUpdate": "<qualified|nurturing|closed_won|closed_lost|no_change>"
}`;
