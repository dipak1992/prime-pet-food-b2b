import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      order: { customerId: profile.customerId },
    },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          orderNumber: true,
          grandTotal: true,
          createdAt: true,
        },
      },
      transactions: true,
    },
    take: 50,
  });

  return NextResponse.json({
    invoices: invoices.map((invoice) => ({
      ...invoice,
      amount: Number(invoice.amount),
      transactions: invoice.transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
    })),
  });
}
