import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ leads });
}

export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json();
  const { businessName, contactName, email, phone, source, notes } = body;

  if (!businessName || !contactName || !email) {
    return NextResponse.json({ error: "businessName, contactName, and email are required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      businessName,
      contactName,
      email,
      phone,
      source: source || "MANUAL",
      notes,
    },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
