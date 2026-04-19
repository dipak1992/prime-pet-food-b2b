import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await db.customer.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const tickets = await db.supportRequest.findMany({
      where: { customerId: customer.id },
      include: {
        responses: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        message: t.message,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        responses: t.responses.map((r) => ({
          id: r.id,
          message: r.message,
          authorRole: r.authorRole,
          createdAt: r.createdAt,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subject, category, priority, message } = await req.json();

    const customer = await db.customer.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Generate ticket number
    const lastTicket = await db.supportRequest.findFirst({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    const ticketNumber = lastTicket
      ? `TKT-${(parseInt(lastTicket.ticketNumber.split("-")[1]) + 1).toString().padStart(4, "0")}`
      : "TKT-0001";

    const ticket = await db.supportRequest.create({
      data: {
        customerId: customer.id,
        ticketNumber,
        subject,
        category,
        priority,
        message,
        status: "open",
      },
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
      },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
