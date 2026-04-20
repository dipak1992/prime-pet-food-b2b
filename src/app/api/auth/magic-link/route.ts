import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const ADMIN_EMAILS = new Set(["admin@theprimepetfood.com", "admin@theperimeprtfood.com"]);
const DEFAULT_FROM_EMAIL = "Prime Pet Food Wholesale Team <wholesale@theprimepetfood.com>";

type MagicLinkMode = "buyer" | "admin";

function isValidMode(value: string): value is MagicLinkMode {
  return value === "buyer" || value === "admin";
}

function getSenderEmail(raw: string | undefined): string {
  if (!raw) {
    return DEFAULT_FROM_EMAIL;
  }

  const trimmed = raw.trim();
  const angleEmailMatch = trimmed.match(/<([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)>/);
  if (angleEmailMatch) {
    return trimmed;
  }

  const plainEmailMatch = trimmed.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (plainEmailMatch?.[1]) {
    return `Prime Pet Food Wholesale Team <${plainEmailMatch[1]}>`;
  }

  return DEFAULT_FROM_EMAIL;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const mode = String(body?.mode || "").trim().toLowerCase();

    if (!email || !isValidMode(mode)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Email provider is not configured" }, { status: 500 });
    }

    if (mode === "admin" && !ADMIN_EMAILS.has(email)) {
      return NextResponse.json({ error: "Only admin email is allowed" }, { status: 403 });
    }

    const issuedAt = Date.now();
    const next = mode === "admin" ? "/admin" : "/dashboard";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(next)}&issuedAt=${issuedAt}`;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const actionLink = data?.properties?.action_link;
    if (!actionLink) {
      return NextResponse.json({ error: "Failed to generate magic link" }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const subject =
      mode === "admin"
        ? "Prime Pet Food Admin Login Link (Expires in 60 seconds)"
        : "Prime Pet Food Wholesale Login Link (Expires in 60 seconds)";
    const html = `
      <p>Hello,</p>
      <p>Your secure ${mode === "admin" ? "admin" : "wholesale"} login link is ready.</p>
      <p><strong>This link expires in 60 seconds.</strong></p>
      <p><a href="${actionLink}">Log in now</a></p>
      <p>If you did not request this, you can ignore this email.</p>
      <p>Prime Pet Food Wholesale Team</p>
    `;
    const text = `Your ${mode} login link (expires in 60 seconds): ${actionLink}`;

    const sent = await resend.emails.send({
      from: getSenderEmail(process.env.FROM_EMAIL),
      to: [email],
      subject,
      html,
      text,
    });

    if (sent.error) {
      return NextResponse.json({ error: "Email delivery failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 });
  }
}