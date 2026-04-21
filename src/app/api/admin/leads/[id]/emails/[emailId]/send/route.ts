import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

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

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  try {
    const resend = new Resend(resendKey);
    const from = process.env.FROM_EMAIL || "outreach@theprimepetfood.com";

    await resend.emails.send({
      from,
      to: recipientEmail,
      subject: emailRecord.subject,
      text: emailRecord.body,
    });

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
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
