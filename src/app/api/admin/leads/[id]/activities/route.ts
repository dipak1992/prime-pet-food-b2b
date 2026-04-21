import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const activities = await prisma.leadActivity.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ activities });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const { type, title, detail } = await req.json() as { type?: string; title?: string; detail?: string };

  if (!type || !title) {
    return NextResponse.json({ error: "type and title are required" }, { status: 400 });
  }

  const activity = await prisma.leadActivity.create({
    data: { leadId: id, type, title, detail: detail ?? null },
  });

  return NextResponse.json({ activity }, { status: 201 });
}
