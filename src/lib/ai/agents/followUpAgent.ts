/**
 * Follow-Up Agent
 * Manages follow-up sequences for leads that have been contacted.
 * Generates follow-up drafts for admin approval (human-in-the-loop).
 */

import { prisma } from "@/lib/prisma";
import { llmJson } from "../llm";
import { FOLLOW_UP_SYSTEM_PROMPT, FOLLOW_UP_USER_PROMPT } from "../prompts/followUp";
import { registerAgent, type AgentContext, type AgentRunResult } from "../runner";

interface FollowUpDecision {
  action: "send_followup" | "wait" | "close" | "escalate";
  reasoning: string;
  waitDays?: number;
  draft?: {
    subject: string;
    body: string;
    angle: string;
  };
  suggestedNextStep: string;
}

async function followUpAgentFn(context: AgentContext): Promise<AgentRunResult> {
  // Find leads that were contacted but haven't replied, and have no pending follow-up
  const contactedLeads = await prisma.lead.findMany({
    where: {
      status: "CONTACTED",
      emails: {
        some: { status: { in: ["SENT", "DRAFT"] } },
      },
    },
    include: {
      emails: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      sequences: {
        where: { status: "ACTIVE" },
        take: 1,
      },
    },
    take: 10,
    orderBy: { updatedAt: "asc" },
  });

  if (contactedLeads.length === 0) {
    return {
      success: true,
      message: "No leads require follow-up at this time",
      data: { processed: 0 },
    };
  }

  let tasksCreated = 0;
  const actions: Array<{ lead: string; action: string; subject?: string }> = [];

  for (const lead of contactedLeads) {
    try {
      const lastEmail = lead.emails[0];
      if (!lastEmail) continue;

      const daysSinceLastContact = Math.floor(
        (Date.now() - new Date(lastEmail.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Skip if contacted too recently (less than 3 days)
      if (daysSinceLastContact < 3) continue;

      const sentEmails = lead.emails.filter((e) => e.status === "SENT");
      const followUpNumber = sentEmails.length + 1;

      // Max 3 follow-ups
      if (followUpNumber > 4) {
        actions.push({ lead: lead.businessName, action: "max_followups_reached" });
        continue;
      }

      // Check if there's already a pending follow-up task
      const existingTask = await prisma.followUpTask.findFirst({
        where: {
          leadId: lead.id,
          status: { in: ["pending", "approved"] },
        },
      });
      if (existingTask) continue;

      const decision = await llmJson<FollowUpDecision>(
        FOLLOW_UP_SYSTEM_PROMPT,
        FOLLOW_UP_USER_PROMPT({
          businessName: lead.businessName,
          contactName: lead.contactName || undefined,
          followUpNumber,
          daysSinceLastContact,
          previousEmails: lead.emails.map((e) => ({
            subject: e.subject,
            sentAt: new Date(e.createdAt).toLocaleDateString(),
          })),
          leadScore: lead.leadScore || undefined,
          notes: lead.notes || undefined,
        }),
        { temperature: 0.7 }
      );

      if (decision.action === "send_followup" && decision.draft) {
        // Create a follow-up task for admin approval
        await prisma.followUpTask.create({
          data: {
            leadId: lead.id,
            type: "email",
            status: "pending",
            scheduledFor: new Date(),
            subject: decision.draft.subject,
            draftContent: decision.draft.body,
            metadata: {
              followUpNumber,
              angle: decision.draft.angle,
              reasoning: decision.reasoning,
              suggestedNextStep: decision.suggestedNextStep,
              generatedByRun: context.runId,
            },
          },
        });

        tasksCreated++;
        actions.push({
          lead: lead.businessName,
          action: "follow_up_drafted",
          subject: decision.draft.subject,
        });
      } else if (decision.action === "wait") {
        // Schedule a future check
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + (decision.waitDays || 3));

        await prisma.followUpTask.create({
          data: {
            leadId: lead.id,
            type: "check_in",
            status: "pending",
            scheduledFor: futureDate,
            subject: `Re-evaluate follow-up for ${lead.businessName}`,
            draftContent: decision.reasoning,
            metadata: {
              action: "wait",
              reasoning: decision.reasoning,
              generatedByRun: context.runId,
            },
          },
        });

        actions.push({ lead: lead.businessName, action: "wait" });
      } else if (decision.action === "close") {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "ARCHIVED" },
        });

        await prisma.leadActivity.create({
          data: {
            leadId: lead.id,
            type: "AI_CLOSED",
            title: "AI recommended closing this lead",
            detail: decision.reasoning,
          },
        });

        actions.push({ lead: lead.businessName, action: "closed" });
      }
    } catch (error) {
      console.error(`Follow-up agent error for ${lead.businessName}:`, error);
    }
  }

  return {
    success: true,
    message: `Processed ${contactedLeads.length} leads, created ${tasksCreated} follow-up drafts`,
    data: { processed: contactedLeads.length, tasksCreated, actions },
    recommendations: tasksCreated > 0
      ? [
          {
            type: "follow_up",
            title: `${tasksCreated} follow-up emails ready for review`,
            description: `AI has drafted ${tasksCreated} follow-up emails. Review and approve to send.`,
            priority: "high" as const,
            actionUrl: "/admin/ai/followups",
            metadata: { tasksCreated },
          },
        ]
      : [],
  };
}

registerAgent("follow_up", followUpAgentFn);

export { followUpAgentFn as followUpAgent };
