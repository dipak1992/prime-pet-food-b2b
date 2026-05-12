/**
 * Lead Qualifier Agent
 * Scores and qualifies leads using AI analysis.
 * Extends existing lead scoring with LLM-powered insights.
 */

import { prisma } from "@/lib/prisma";
import { llmJson } from "../llm";
import { QUALIFICATION_SYSTEM_PROMPT, QUALIFICATION_USER_PROMPT } from "../prompts/qualification";
import { registerAgent, type AgentContext, type AgentRunResult } from "../runner";

interface QualificationResult {
  score: number;
  tier: "hot" | "warm" | "cold";
  reasoning: string;
  strengths: string[];
  concerns: string[];
  suggestedApproach: string;
  estimatedMonthlyVolume: string;
  priorityLevel: string;
}

async function leadQualifierAgent(context: AgentContext): Promise<AgentRunResult> {
  // Find unscored or newly found leads
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { leadScore: 0 },
        { leadScore: null },
        { status: "NEW" },
      ],
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  if (leads.length === 0) {
    return {
      success: true,
      message: "No unqualified leads to process",
      data: { processed: 0 },
    };
  }

  let qualified = 0;
  let hotLeads = 0;
  const results: Array<{ name: string; score: number; tier: string }> = [];

  for (const lead of leads) {
    try {
      // Parse stored notes for metadata
      let metadata: Record<string, unknown> = {};
      try {
        if (lead.notes) {
          metadata = JSON.parse(lead.notes);
        }
      } catch {
        // notes may not be JSON, that's fine
      }

      const qualification = await llmJson<QualificationResult>(
        QUALIFICATION_SYSTEM_PROMPT,
        QUALIFICATION_USER_PROMPT({
          businessName: lead.businessName,
          businessType: (metadata.types as string[])?.join(", ") || undefined,
          address: lead.address || undefined,
          city: lead.city || undefined,
          state: lead.state || undefined,
          website: lead.website || undefined,
          phone: lead.phone || undefined,
          rating: metadata.rating as number | undefined,
          reviewCount: metadata.reviewCount as number | undefined,
          description: metadata.description as string | undefined,
        }),
        { temperature: 0.3 }
      );

      // Update lead with qualification results
      const newStatus = qualification.tier === "hot" ? "QUALIFIED" : qualification.tier === "warm" ? "CONTACTED" : "NEW";

      // Store qualification data in notes as JSON
      const qualificationData = {
        ...metadata,
        qualification: {
          tier: qualification.tier,
          reasoning: qualification.reasoning,
          strengths: qualification.strengths,
          concerns: qualification.concerns,
          suggestedApproach: qualification.suggestedApproach,
          estimatedMonthlyVolume: qualification.estimatedMonthlyVolume,
          qualifiedAt: new Date().toISOString(),
          qualifiedByRun: context.runId,
        },
      };

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          leadScore: Math.min(100, Math.max(0, qualification.score)),
          leadTemperature: qualification.tier,
          status: newStatus,
          notes: JSON.stringify(qualificationData),
        },
      });

      // Log activity
      await prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "NOTE",
          title: `AI Qualified: ${qualification.tier} (Score: ${qualification.score})`,
          detail: qualification.reasoning,
        },
      });

      qualified++;
      if (qualification.tier === "hot") hotLeads++;
      results.push({ name: lead.businessName, score: qualification.score, tier: qualification.tier });
    } catch (error) {
      console.error(`Failed to qualify lead ${lead.businessName}:`, error);
    }
  }

  return {
    success: true,
    message: `Qualified ${qualified} leads (${hotLeads} hot)`,
    data: {
      processed: qualified,
      hotLeads,
      results,
    },
    recommendations: hotLeads > 0
      ? [
          {
            type: "qualification",
            title: `${hotLeads} hot leads ready for outreach`,
            description: `AI qualification identified ${hotLeads} high-potential leads ready for personalized outreach. Review and approve outreach drafts.`,
            priority: "high" as const,
            actionUrl: "/admin/ai/outreach",
            metadata: { hotLeads: results.filter((r) => r.tier === "hot") },
          },
        ]
      : [],
  };
}

// Register the agent
registerAgent("lead_qualifier", leadQualifierAgent);

export { leadQualifierAgent };
