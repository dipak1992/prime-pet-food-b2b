import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, businessName, businessType, sourcePage, intentType, location } = body;

    if (!email || !businessName) {
      return NextResponse.json({ error: "email and businessName are required" }, { status: 400 });
    }

    // Only create if email doesn't already exist as a lead
    const existing = await prisma.lead.findFirst({ where: { email } });

    if (!existing) {
      const noteParts = [
        intentType ? `Intent: ${intentType}` : null,
        location ? `Location: ${location}` : null,
        sourcePage ? `Source page: ${sourcePage}` : null,
        businessType ? `Business type: ${businessType}` : null,
      ].filter(Boolean);

      await prisma.lead.create({
        data: {
          email,
          businessName: businessName ?? "",
          contactName: businessName ?? "", // required field — use businessName as fallback
          source: sourcePage ?? "seo",
          status: "NEW",
          leadScore: 30, // base score for SEO lead
          leadType: businessType ?? null,
          notes: noteParts.length > 0 ? noteParts.join(" | ") : null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[seo/lead-capture]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
