import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: profile.customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true, invoice: true },
  });

  return NextResponse.json({ orders });
}
