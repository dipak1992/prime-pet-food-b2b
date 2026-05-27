import { NextRequest, NextResponse } from "next/server";
import { emailTemplates, EmailPayload, renderEmailBody, sendRawEmail } from "@/lib/email";

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

    const body = renderEmailBody(payload);
    const sendResult = await sendRawEmail({
      to: payload.to,
      subject: body.subject,
      text: body.text,
      html: body.html,
    });

    if (sendResult.skipped) {
      return NextResponse.json(
        { error: "Email provider is not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent",
      providerId: sendResult.providerId,
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
