import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { emailTemplates, EmailPayload, renderEmailBody } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const payload: EmailPayload = await request.json();

    // Validate payload
    if (!payload.to || !payload.template) {
      return NextResponse.json(
        { error: "Missing required fields: to, template" },
        { status: 400 }
      );
    }

    const template = emailTemplates[payload.template];
    if (!template) {
      return NextResponse.json(
        { error: "Invalid email template" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) {
      return NextResponse.json(
        { error: "Email provider is not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = renderEmailBody(payload);

    const sendResult = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: [payload.to],
      subject: body.subject,
      text: body.text,
      html: body.html,
    });

    if (sendResult.error) {
      console.error("Resend send error", sendResult.error);
      return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: "Email sent",
      providerId: sendResult.data?.id,
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
