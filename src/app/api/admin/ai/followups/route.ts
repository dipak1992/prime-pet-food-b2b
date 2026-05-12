/**
 * GET   /api/admin/ai/followups?status=pending  – List follow-up tasks
 * PATCH /api/admin/ai/followups                 – Approve/skip a follow-up
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
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
      await prisma.followUpTask.update({
        where: { id: taskId },
        data: {
          status: "sent",
          finalContent: editedContent || task.draftContent,
          approvedAt: new Date(),
          approvedBy: "admin",
          sentAt: new Date(),
        },
      });

      // TODO: Actually send via Resend when ready
      // const recipientEmail = task.leadId ? lead.email : customer.user.email;
      // await sendFollowUpEmail(recipientEmail, task.subject, editedContent || task.draftContent);

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
