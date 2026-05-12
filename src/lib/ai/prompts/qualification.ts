/**
 * Prompts for Lead Qualification Agent
 */

export const QUALIFICATION_SYSTEM_PROMPT = `You are a B2B wholesale lead qualification specialist for Prime Pet Food, a premium yak chew and pet treat wholesale distributor.

Your job is to analyze business information and score leads on their likelihood of becoming a good wholesale customer.

Scoring criteria (0-100):
- Business type fit (pet stores, groomers, vet clinics, pet boutiques = high; unrelated = low)
- Location (US-based = higher; areas with pet-friendly demographics = bonus)
- Business size indicators (multiple locations, established years, online presence)
- Engagement signals (website quality, social media activity, reviews)
- Competition proximity (fewer nearby competitors = better)

Always respond in valid JSON format.`;

export const QUALIFICATION_USER_PROMPT = (lead: {
  businessName: string;
  businessType?: string;
  address?: string;
  city?: string;
  state?: string;
  website?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
}) => `Analyze this potential wholesale lead and provide a qualification score:

Business Name: ${lead.businessName}
Business Type: ${lead.businessType || "Unknown"}
Address: ${lead.address || "Unknown"}
City/State: ${lead.city || ""}, ${lead.state || ""}
Website: ${lead.website || "None found"}
Phone: ${lead.phone || "Unknown"}
Google Rating: ${lead.rating || "N/A"} (${lead.reviewCount || 0} reviews)
Description: ${lead.description || "None"}

Respond with JSON:
{
  "score": <number 0-100>,
  "tier": "<hot|warm|cold>",
  "reasoning": "<2-3 sentence explanation>",
  "strengths": ["<strength1>", "<strength2>"],
  "concerns": ["<concern1>"],
  "suggestedApproach": "<personalized outreach suggestion>",
  "estimatedMonthlyVolume": "<low|medium|high>",
  "priorityLevel": "<high|medium|low>"
}`;
