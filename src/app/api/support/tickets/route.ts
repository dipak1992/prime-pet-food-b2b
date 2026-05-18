import { requireApprovedBuyer } from "@/lib/auth/guards";
import { trackAttributionEvent } from "@/lib/attribution";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { buildQuoteRequestData, isQuotePipelineRequest } from "@/lib/quote-pipeline";
import { calculateDueAt } from "@/lib/sla";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await requireApprovedBuyer();
    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const tickets = await prisma.supportRequest.findMany({
      where: { customerId: profile.customerId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: `TKT-${t.id.slice(0, 8).toUpperCase()}`,
        subject: t.subject,
        category: t.type,
        priority: "normal",
        status: t.status,
        message: t.message,
        dueAt: t.dueAt,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        responses: [],
      })),
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();
    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const { subject, category, priority, message, source, campaign, page } = await req.json();

    const normalizedCategory = String(category || "GENERAL").toUpperCase();
    const type =
      normalizedCategory === "SAMPLE_REQUEST" || normalizedCategory === "SAMPLE"
        ? "SAMPLE_REQUEST"
        : normalizedCategory === "CUSTOM_PRICING" || normalizedCategory === "PRICING"
          ? "CUSTOM_PRICING"
          : normalizedCategory === "SALES_REP" || normalizedCategory === "SALES"
            ? "SALES_REP"
            : "GENERAL";
    const dueAt = await calculateDueAt(
      isQuotePipelineRequest(normalizedCategory) ? "QUOTE_REQUEST" : "SUPPORT_REQUEST",
      type,
      priority,
    );

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.supportRequest.create({
        data: {
          customerId: profile.customerId!,
          type,
          subject,
          message,
          dueAt,
        },
      });

      if (isQuotePipelineRequest(normalizedCategory)) {
        await tx.quoteRequest.create({
          data: await buildQuoteRequestData({
            customerId: profile.customerId!,
            supportRequestId: created.id,
            requestType: normalizedCategory,
            message,
            dueAt,
          }),
        });
      }

      return created;
    });

    const ticketNumber = `TKT-${ticket.id.slice(0, 8).toUpperCase()}`;

    await trackAttributionEvent({
      email: profile.email,
      customerId: profile.customerId,
      source: source || "portal",
      medium: "buyer_portal",
      campaign: campaign || null,
      page: page || "/quote",
      eventType: isQuotePipelineRequest(normalizedCategory) ? "quote_request" : "support_request",
      metadata: {
        requestType: normalizedCategory,
        supportRequestId: ticket.id,
        priority: priority || "normal",
      },
    }).catch((error) => {
      console.error("Failed to track support attribution:", error);
    });

    if (profile.email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
        await sendEmail({
          to: profile.email,
          template: "support-acknowledgment",
          variables: {
            ticketNumber,
            subject,
            requestType: type,
            ticketUrl: appUrl ? `${appUrl}/support` : "",
          },
        });
      } catch (error) {
        console.error("Failed to send support acknowledgment email:", error);
      }
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber,
        priority: priority || "normal",
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
