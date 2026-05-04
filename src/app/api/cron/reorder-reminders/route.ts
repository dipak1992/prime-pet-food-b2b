import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const settingKey = "reorder-reminders:last-run-date";
  const lastRun = await prisma.setting.findUnique({ where: { key: settingKey } });
  if (lastRun?.value === todayKey) {
    return NextResponse.json({ skipped: true, reason: "Already processed today" });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const latestOrders = await prisma.order.groupBy({
    by: ["customerId"],
    _max: { createdAt: true },
  });

  const dueCustomerIds = latestOrders
    .filter((row) => row._max.createdAt && row._max.createdAt < cutoff)
    .map((row) => row.customerId)
    .slice(0, 50);

  const customers = await prisma.customer.findMany({
    where: { id: { in: dueCustomerIds }, accountStatus: "APPROVED" },
    include: {
      user: { select: { email: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { items: { take: 3 } },
      },
    },
  });

  const results = await Promise.all(
    customers.map((customer) => {
      const lastOrder = customer.orders[0];
      return sendEmail({
        to: customer.user.email,
        template: "reorder-reminder",
        variables: {
          businessName: customer.businessName,
          lastOrderNumber: lastOrder?.orderNumber || "",
          products:
            lastOrder?.items.map((item) => item.productTitleSnapshot).join(", ") ||
            "your previous best sellers",
          reorderUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/quick-order`,
        },
      }).catch((error) => ({ error: error instanceof Error ? error.message : "Email failed" }));
    })
  );

  await prisma.setting.upsert({
    where: { key: settingKey },
    create: { key: settingKey, value: todayKey },
    update: { value: todayKey },
  });

  return NextResponse.json({
    processed: customers.length,
    results,
  });
}
