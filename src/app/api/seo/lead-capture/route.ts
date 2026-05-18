import { NextRequest, NextResponse } from "next/server";
import { trackAttributionEvent } from "@/lib/attribution";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, businessName, businessType, sourcePage, intentType, location } = body;

    if (!email || !businessName) {
      return NextResponse.json({ error: "email and businessName are required" }, { status: 400 });
    }

    const existing = await prisma.lead.findFirst({ where: { email } });

    const lead =
      existing ||
      (await prisma.lead.create({
        data: {
          email,
          businessName: businessName ?? "",
          contactName: businessName ?? "",
          source: sourcePage ?? "seo",
          status: "NEW",
          leadScore: 30,
          leadType: businessType ?? null,
          notes:
            [
              intentType ? `Intent: ${intentType}` : null,
              location ? `Location: ${location}` : null,
              sourcePage ? `Source page: ${sourcePage}` : null,
              businessType ? `Business type: ${businessType}` : null,
            ]
              .filter(Boolean)
              .join(" | ") || null,
        },
      }));

    await trackAttributionEvent({
      email,
      businessName,
      leadId: lead.id,
      source: sourcePage ?? "seo",
      medium: "organic",
      page: sourcePage ?? null,
      eventType: "seo_lead_capture",
      metadata: { intentType, location, businessType },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[seo/lead-capture]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
