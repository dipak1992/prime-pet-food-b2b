import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  // Customers with ≥2 orders whose most recent order is 30+ days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const customers = await prisma.customer.findMany({
    where: { accountStatus: "APPROVED" },
    include: {
      user: { select: { email: true, name: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          grandTotal: true,
          createdAt: true,
          items: {
            orderBy: { totalPrice: "desc" },
            take: 3,
            select: { productTitleSnapshot: true, quantity: true },
          },
        },
      },
    },
  });

  const predictions = await prisma.reorderPrediction.findMany({
    where: {
      customerId: { in: customers.map((customer) => customer.id) },
      status: { in: ["pending", "notified"] },
    },
    orderBy: [{ predictedDate: "asc" }, { createdAt: "desc" }],
  });
  const predictionByCustomer = new Map<string, (typeof predictions)[number]>();
  for (const prediction of predictions) {
    if (!predictionByCustomer.has(prediction.customerId)) {
      predictionByCustomer.set(prediction.customerId, prediction);
    }
  }

  const reorders = customers
    .filter((c) => c.orders.length >= 2)
    .map((c) => {
      const lastOrder = c.orders[0];
      const lastOrderDate = new Date(lastOrder.createdAt);
      if (lastOrderDate >= thirtyDaysAgo) return null;

      const totalOrders = c.orders.length;
      const lifetimeValue = c.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

      // Compute average interval between orders
      let avgIntervalDays = 0;
      if (totalOrders >= 2) {
        const intervals: number[] = [];
        for (let i = 0; i < totalOrders - 1; i++) {
          const diff =
            new Date(c.orders[i].createdAt).getTime() -
            new Date(c.orders[i + 1].createdAt).getTime();
          intervals.push(diff / (1000 * 60 * 60 * 24));
        }
        avgIntervalDays = Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length);
      }

      const suggestedReorderDate = new Date(lastOrderDate);
      suggestedReorderDate.setDate(suggestedReorderDate.getDate() + avgIntervalDays);

      const daysSinceLastOrder = Math.floor(
        (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const prediction = predictionByCustomer.get(c.id);
      const suggestedProducts = Array.isArray(prediction?.suggestedProducts)
        ? prediction.suggestedProducts.filter((item): item is string => typeof item === "string")
        : lastOrder.items.map((item) => item.productTitleSnapshot);

      return {
        id: c.id,
        businessName: c.businessName,
        email: c.user?.email,
        tier: c.tier,
        totalOrders,
        lifetimeValue,
        lastOrderDate: lastOrder.createdAt,
        avgIntervalDays,
        suggestedReorderDate: prediction?.predictedDate ?? suggestedReorderDate,
        daysSinceLastOrder,
        confidence: prediction?.confidence ?? null,
        reasoning: prediction?.reasoning ?? null,
        suggestedProducts,
        estimatedOrderValue: prediction?.estimatedOrderValue ?? null,
        urgency:
          daysSinceLastOrder > Math.max(45, avgIntervalDays + 14)
            ? "HIGH"
            : daysSinceLastOrder > Math.max(30, avgIntervalDays)
              ? "MEDIUM"
              : "LOW",
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.daysSinceLastOrder - a!.daysSinceLastOrder));

  return NextResponse.json({ reorders });
}

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => ({}));
  const customerId = typeof body.customerId === "string" ? body.customerId : "";

  if (!customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      user: { select: { email: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          items: {
            take: 3,
            orderBy: { totalPrice: "desc" },
            select: { productTitleSnapshot: true },
          },
        },
      },
    },
  });

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  if (!customer.user?.email) {
    return NextResponse.json({ error: "Customer does not have an email address" }, { status: 400 });
  }

  const products = customer.orders[0]?.items.map((item) => item.productTitleSnapshot).join(", ");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  await sendEmail({
    to: customer.user.email,
    template: "reorder-reminder",
    variables: {
      businessName: customer.businessName,
      products: products || "your previous best sellers",
      reorderUrl: appUrl ? `${appUrl}/quick-order` : "/quick-order",
    },
  });

  return NextResponse.json({ success: true });
}
