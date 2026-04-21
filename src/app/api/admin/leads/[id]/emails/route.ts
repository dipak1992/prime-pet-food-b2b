import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const emails = await prisma.outreachEmail.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ emails });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const { subject, body } = await req.json() as { subject?: string; body?: string };

  if (!subject || !body) {
    return NextResponse.json({ error: "subject and body are required" }, { status: 400 });
  }

  const email = await prisma.outreachEmail.create({
    data: { leadId: id, subject, body, status: "DRAFT" },
  });

  return NextResponse.json({ email }, { status: 201 });
}
