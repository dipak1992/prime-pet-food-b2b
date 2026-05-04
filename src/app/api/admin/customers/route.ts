import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { calculateCustomerMetrics } from "@/lib/customer-metrics";
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

  const emails = customers.map((customer) => customer.user.email.toLowerCase());
  const businessNames = customers.map((customer) => customer.businessName.toLowerCase());
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { email: { in: emails, mode: "insensitive" } },
        { businessName: { in: businessNames, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      businessName: true,
      email: true,
      source: true,
      status: true,
      createdAt: true,
      contactedAt: true,
    },
  });
  const leadsByEmail = new Map(leads.map((lead) => [lead.email.toLowerCase(), lead]));
  const leadsByBusiness = new Map(leads.map((lead) => [lead.businessName.toLowerCase(), lead]));

  const customersWithStats = customers.map((customer) => {
    const matchedLead =
      leadsByEmail.get(customer.user.email.toLowerCase()) ||
      leadsByBusiness.get(customer.businessName.toLowerCase()) ||
      null;
    const metrics = calculateCustomerMetrics(customer.orders, customer.tier);

    return {
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
      metrics,
      attribution: matchedLead
        ? {
            leadId: matchedLead.id,
            source: matchedLead.source,
            status: matchedLead.status,
            leadCreatedAt: matchedLead.createdAt,
            contactedAt: matchedLead.contactedAt,
          }
        : null,
    };
  });

  return NextResponse.json({ customers: customersWithStats });
}
