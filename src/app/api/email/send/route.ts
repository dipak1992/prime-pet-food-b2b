import { NextRequest, NextResponse } from "next/server";
import { emailTemplates, EmailPayload } from "@/lib/email";

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

    // TODO: Integrate with actual email service (Resend, SendGrid, etc.)
    // For now, just log to console
    console.log("📧 Email would be sent:", {
      to: payload.to,
      template: payload.template,
      subject: template.subject,
      variables: payload.variables,
    });

    return NextResponse.json({
      success: true,
      message: "Email queued (service not yet configured)",
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
