import { NextRequest, NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/guards";
import { calculateCustomerMetrics } from "@/lib/customer-metrics";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: profile.userId },
    select: {
      id: true,
      name: true,
      email: true,
      customer: {
        select: {
          id: true,
          businessName: true,
          businessType: true,
          tier: true,
          accountStatus: true,
          addresses: {
            orderBy: { createdAt: "asc" },
          },
          orders: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              createdAt: true,
              grandTotal: true,
              paymentStatus: true,
            },
          },
        },
      },
    },
  });

  const userWithMetrics =
    user?.customer
      ? {
          ...user,
          customer: {
            ...user.customer,
            metrics: calculateCustomerMetrics(user.customer.orders, user.customer.tier),
            orders: undefined,
          },
        }
      : user;

  return NextResponse.json({ authenticated: true, profile, user: userWithMetrics });
}

export async function PATCH(req: NextRequest) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, businessName } = body as { name?: string; businessName?: string };

  const user = await prisma.user.update({
    where: { authUserId: profile.userId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(businessName !== undefined && {
        customer: { update: { businessName: businessName.trim() } },
      }),
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}
