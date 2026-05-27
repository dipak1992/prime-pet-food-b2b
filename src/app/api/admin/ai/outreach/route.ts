/**
 * GET   /api/admin/ai/outreach?status=DRAFT  – List outreach emails
 * PATCH /api/admin/ai/outreach               – Approve/reject an email
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
    await requireAdmin();
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
      const subject = editedSubject?.trim() || email.subject;
      const body = editedBody?.trim() || email.body;

      if (!isValidEmail(email.lead.email)) {
        return NextResponse.json({ error: "Lead has no valid recipient email" }, { status: 400 });
      }

      const sendResult = await sendRawEmail({
        to: email.lead.email,
        subject,
        text: body,
      });

      if (sendResult.skipped) {
        return NextResponse.json({ error: sendResult.reason }, { status: 500 });
      }

      await prisma.$transaction([
        prisma.outreachEmail.update({
          where: { id: emailId },
          data: {
            subject,
            body,
            status: "SENT",
            sentAt: new Date(),
          },
        }),
        prisma.lead.update({
          where: { id: email.leadId },
          data: {
            status: "CONTACTED",
            contactedAt: new Date(),
          },
        }),
        prisma.leadActivity.create({
          data: {
            leadId: email.leadId,
            type: "EMAIL_SENT",
            title: `Sent AI outreach: ${subject}`,
            detail: sendResult.providerId ? `Resend message ID: ${sendResult.providerId}` : null,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: "Email approved and sent" });
    } else {
      // Reject
      await prisma.$transaction([
        prisma.outreachEmail.update({
          where: { id: emailId },
          data: { status: "FAILED" },
        }),
        prisma.leadActivity.create({
          data: {
            leadId: email.leadId,
            type: "EMAIL_REJECTED",
            title: `Rejected AI outreach: ${email.subject}`,
          },
        }),
      ]);

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
