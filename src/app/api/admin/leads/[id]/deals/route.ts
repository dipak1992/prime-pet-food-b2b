import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;

  const deals = await prisma.leadDeal.findMany({
    where: { leadId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ deals });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const { status, value } = await req.json() as {
    status?: string;
    value?: number;
  };

  const deal = await prisma.leadDeal.create({
    data: {
      leadId: id,
      status: status ?? "OPEN",
      value: value ?? 0,
    },
  });

  await prisma.leadActivity.create({
    data: { leadId: id, type: "DEAL_CREATED", title: `Deal created: ${status ?? "OPEN"}` },
  });

  return NextResponse.json({ deal }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await requireAdmin();
  const { id } = await params;
  const { dealId, status, value, lossReason, closedAt } = await req.json() as {
    dealId?: string;
    status?: string;
    value?: number;
    lossReason?: string;
    closedAt?: string;
  };

  if (!dealId) return NextResponse.json({ error: "dealId is required" }, { status: 400 });

  const deal = await prisma.leadDeal.update({
    where: { id: dealId, leadId: id },
    data: {
      ...(status !== undefined && { status }),
      ...(value !== undefined && { value }),
      ...(lossReason !== undefined && { lossReason }),
      ...(closedAt !== undefined && { closedAt: new Date(closedAt) }),
    },
  });

  return NextResponse.json({ deal });
}
