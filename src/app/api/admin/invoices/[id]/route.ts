import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { status, paidAt, dueDate } = body;

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
    },
  });

  return NextResponse.json({ invoice: { ...updated, amount: Number(updated.amount) } });
}
