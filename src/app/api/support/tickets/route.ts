import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
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

    const { subject, category, priority, message } = await req.json();

    const normalizedCategory = String(category || "GENERAL").toUpperCase();
    const type =
      normalizedCategory === "SAMPLE_REQUEST" || normalizedCategory === "SAMPLE"
        ? "SAMPLE_REQUEST"
        : normalizedCategory === "CUSTOM_PRICING" || normalizedCategory === "PRICING"
          ? "CUSTOM_PRICING"
          : normalizedCategory === "SALES_REP" || normalizedCategory === "SALES"
            ? "SALES_REP"
            : "GENERAL";

    const ticket = await prisma.supportRequest.create({
      data: {
        customerId: profile.customerId,
        type,
        subject,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: `TKT-${ticket.id.slice(0, 8).toUpperCase()}`,
        priority: priority || "normal",
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
