import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          lastLoginAt: true,
        },
      },
      addresses: true,
      orders: true,
    },
  });

  const customersWithStats = customers.map((customer) => ({
    id: customer.id,
    businessName: customer.businessName,
    businessType: customer.businessType,
    tier: customer.tier,
    accountStatus: customer.accountStatus,
    approvedAt: customer.approvedAt,
    user: customer.user,
    addressCount: customer.addresses.length,
    orderCount: customer.orders.length,
    totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.grandTotal), 0),
  }));

  return NextResponse.json({ customers: customersWithStats });
}
