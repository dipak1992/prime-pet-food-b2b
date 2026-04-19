import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: {
        include: {
          customer: { select: { businessName: true, user: { select: { email: true } } } },
        },
      },
    },
  });

  return NextResponse.json({
    invoices: invoices.map((inv) => ({
      ...inv,
      amount: Number(inv.amount),
    })),
  });
}
