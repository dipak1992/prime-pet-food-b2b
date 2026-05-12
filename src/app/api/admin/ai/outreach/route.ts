/**
 * GET   /api/admin/ai/outreach?status=DRAFT  – List outreach emails
 * PATCH /api/admin/ai/outreach               – Approve/reject an email
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "DRAFT";

    const drafts = await prisma.outreachEmail.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            email: true,
            city: true,
            state: true,
          },
        },
      },
    });

    return NextResponse.json({ drafts });
  } catch (error) {
    console.error("Outreach fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch outreach emails" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailId, action, editedSubject, editedBody } = body as {
      emailId: string;
      action: "approve" | "reject";
      editedSubject?: string;
      editedBody?: string;
    };

    if (!emailId || !action) {
      return NextResponse.json(
        { error: "emailId and action are required" },
        { status: 400 }
      );
    }

    const email = await prisma.outreachEmail.findUnique({
      where: { id: emailId },
      include: { lead: true },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Update with edited content and mark as sent
      await prisma.outreachEmail.update({
        where: { id: emailId },
        data: {
          subject: editedSubject || email.subject,
          body: editedBody || email.body,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      // TODO: Actually send via Resend when ready
      // await sendOutreachEmail(email.lead.email, editedSubject || email.subject, editedBody || email.body);

      return NextResponse.json({ success: true, message: "Email approved and marked as sent" });
    } else {
      // Reject
      await prisma.outreachEmail.update({
        where: { id: emailId },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ success: true, message: "Email rejected" });
    }
  } catch (error) {
    console.error("Outreach action error:", error);
    return NextResponse.json(
      { error: "Failed to process outreach action" },
      { status: 500 }
    );
  }
}
