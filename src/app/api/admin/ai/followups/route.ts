/**
 * GET   /api/admin/ai/followups?status=pending  – List follow-up tasks
 * PATCH /api/admin/ai/followups                 – Approve/skip a follow-up
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { sendRawEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function isValidEmail(value: string | null | undefined): value is string {
  return Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const tasks = await prisma.followUpTask.findMany({
      where: { status },
      orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
      take: 50,
    });

    // Enrich with lead/customer data
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        let lead = null;
        let customer = null;

        if (task.leadId) {
          lead = await prisma.lead.findUnique({
            where: { id: task.leadId },
            select: {
              id: true,
              businessName: true,
              contactName: true,
              email: true,
            },
          });
        }

        if (task.customerId) {
          customer = await prisma.customer.findUnique({
            where: { id: task.customerId },
            select: {
              id: true,
              businessName: true,
              user: { select: { email: true } },
            },
          });
        }

        return { ...task, lead, customer };
      })
    );

    return NextResponse.json({ tasks: enrichedTasks });
  } catch (error) {
    console.error("Follow-ups fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow-up tasks" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { taskId, action, editedContent } = body as {
      taskId: string;
      action: "approve" | "skip";
      editedContent?: string;
    };

    if (!taskId || !action) {
      return NextResponse.json(
        { error: "taskId and action are required" },
        { status: 400 }
      );
    }

    const task = await prisma.followUpTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (action === "approve") {
      let recipientEmail: string | null | undefined = null;
      if (task.leadId) {
        const lead = await prisma.lead.findUnique({
          where: { id: task.leadId },
          select: { email: true },
        });
        recipientEmail = lead?.email;
      } else if (task.customerId) {
        const customer = await prisma.customer.findUnique({
          where: { id: task.customerId },
          select: { user: { select: { email: true } } },
        });
        recipientEmail = customer?.user.email;
      }

      const finalContent = editedContent?.trim() || task.draftContent || "";

      if (!isValidEmail(recipientEmail)) {
        return NextResponse.json({ error: "No valid recipient email address" }, { status: 400 });
      }

      const sendResult = await sendRawEmail({
        to: recipientEmail,
        subject: task.subject || "Following up from Prime Pet Food",
        text: finalContent,
      });

      if (sendResult.skipped) {
        return NextResponse.json({ error: sendResult.reason }, { status: 500 });
      }

      await prisma.followUpTask.update({
        where: { id: taskId },
        data: {
          status: "sent",
          finalContent,
          approvedAt: new Date(),
          approvedBy: "admin",
          sentAt: new Date(),
          metadata: {
            ...(typeof task.metadata === "object" && task.metadata && !Array.isArray(task.metadata)
              ? task.metadata
              : {}),
            providerId: sendResult.providerId,
          },
        },
      });

      return NextResponse.json({ success: true, message: "Follow-up approved and sent" });
    } else {
      await prisma.followUpTask.update({
        where: { id: taskId },
        data: { status: "skipped" },
      });

      return NextResponse.json({ success: true, message: "Follow-up skipped" });
    }
  } catch (error) {
    console.error("Follow-up action error:", error);
    return NextResponse.json(
      { error: "Failed to process follow-up action" },
      { status: 500 }
    );
  }
}
