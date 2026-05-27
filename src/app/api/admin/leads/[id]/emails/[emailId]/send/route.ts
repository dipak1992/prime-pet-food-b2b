import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { sendRawEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string; emailId: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id, emailId } = await params;
  const { toEmail } = await req.json() as { toEmail?: string };

  const [lead, emailRecord] = await Promise.all([
    prisma.lead.findUnique({ where: { id } }),
    prisma.outreachEmail.findUnique({ where: { id: emailId, leadId: id } }),
  ]);

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (!emailRecord) return NextResponse.json({ error: "Email not found" }, { status: 404 });

  const recipientEmail = toEmail || lead.email;
  if (!recipientEmail) {
    return NextResponse.json({ error: "No recipient email address" }, { status: 400 });
  }

  try {
    const sendResult = await sendRawEmail({
      to: recipientEmail,
      subject: emailRecord.subject,
      text: emailRecord.body,
    });

    if (sendResult.skipped) {
      return NextResponse.json({ error: sendResult.reason }, { status: 500 });
    }

    // Mark as sent + update lead
    await Promise.all([
      prisma.outreachEmail.update({
        where: { id: emailId },
        data: { status: "SENT", sentAt: new Date() },
      }),
      prisma.lead.update({
        where: { id },
        data: {
          status: "CONTACTED",
          contactedAt: new Date(),
        },
      }),
      prisma.leadActivity.create({
        data: {
          leadId: id,
          type: "EMAIL_SENT",
          title: `Sent email: "${emailRecord.subject}"`,
          detail: sendResult.providerId ? `Resend message ID: ${sendResult.providerId}` : null,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
