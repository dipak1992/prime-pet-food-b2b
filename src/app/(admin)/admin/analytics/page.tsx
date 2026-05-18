import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateCustomerMetrics } from "@/lib/customer-metrics";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

type StatusCountRow = {
  status: string;
  _count: { _all: number };
};

type PaymentCountRow = {
  paymentStatus: string;
  _count: { _all: number };
};

type TopCustomerRow = {
  customerId: string;
  _sum: { grandTotal: unknown };
  _count: { _all: number };
};

type CustomerMapRow = {
  id: string;
  businessName: string;
};

type SyncJobRow = {
  id: string;
  status: string;
  recordsRead: number;
  recordsUpserted: number;
  createdAt: Date;
  errorMessage: string | null;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminAnalyticsPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const [
    ordersToday,
    orders7d,
    orders30d,
    paidRevenue30d,
    allTimeRevenue,
    statusCounts,
    paymentCounts,
    topCustomers,
    recentSyncJobs,
    openInvoices,
    approvedCustomers,
    productVelocity,
    activeProducts,
    attributionSourceRows,
    attributionEventRows,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.order
      .aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: "PAID" },
        _sum: { grandTotal: true },
      })
      .then((res: { _sum: { grandTotal: unknown } }) => Number(res._sum.grandTotal || 0)),
    prisma.order
      .aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { grandTotal: true },
      })
      .then((res: { _sum: { grandTotal: unknown } }) => Number(res._sum.grandTotal || 0)),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { _count: { status: "desc" } },
    }),
    prisma.order.groupBy({
      by: ["paymentStatus"],
      _count: { _all: true },
      orderBy: { _count: { paymentStatus: "desc" } },
    }),
    prisma.order.groupBy({
      by: ["customerId"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _sum: { grandTotal: true },
      _count: { _all: true },
      orderBy: { _sum: { grandTotal: "desc" } },
      take: 5,
    }),
    prisma.productSyncJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        status: true,
        recordsRead: true,
        recordsUpserted: true,
        createdAt: true,
        errorMessage: true,
      },
    }),
    prisma.invoice.findMany({
      where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } },
      select: { amount: true, dueDate: true, status: true },
    }),
    prisma.customer.findMany({
      where: { accountStatus: "APPROVED" },
      select: {
        id: true,
        businessName: true,
        tier: true,
        orders: {
          select: { createdAt: true, grandTotal: true, paymentStatus: true },
        },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: thirtyDaysAgo } } },
      _sum: { quantity: true, totalPrice: true },
      _count: { _all: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, title: true, sku: true, inventoryQty: true, stockStatus: true },
    }),
    prisma.attributionEvent.groupBy({
      by: ["source"],
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 8,
    }),
    prisma.attributionEvent.groupBy({
      by: ["eventType"],
      _count: { _all: true },
      orderBy: { _count: { eventType: "desc" } },
      take: 8,
    }),
  ]);

  const typedStatusCounts = statusCounts as StatusCountRow[];
  const typedPaymentCounts = paymentCounts as PaymentCountRow[];
  const typedTopCustomers = topCustomers as TopCustomerRow[];
  const typedRecentSyncJobs = recentSyncJobs as SyncJobRow[];

  const customerIds = typedTopCustomers.map((c) => c.customerId);
  const customerMap = customerIds.length
    ? await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, businessName: true },
      })
    : [];
  const typedCustomerMap = customerMap as CustomerMapRow[];

  const customerNameById = new Map(typedCustomerMap.map((c) => [c.id, c.businessName]));

  const recentFailures = typedRecentSyncJobs.filter((j) => j.status === "FAILED").length;
  const invoiceAging = {
    current: 0,
    oneToFifteen: 0,
    sixteenToThirty: 0,
    thirtyOneToSixty: 0,
    sixtyPlus: 0,
  };
  let openInvoiceAmount = 0;
  for (const invoice of openInvoices) {
    const amount = Number(invoice.amount || 0);
    openInvoiceAmount += amount;
    if (!invoice.dueDate) {
      invoiceAging.current += amount;
      continue;
    }
    const daysPastDue = Math.floor((todayStart.getTime() - new Date(invoice.dueDate).getTime()) / 86_400_000);
    if (daysPastDue <= 0) invoiceAging.current += amount;
    else if (daysPastDue <= 15) invoiceAging.oneToFifteen += amount;
    else if (daysPastDue <= 30) invoiceAging.sixteenToThirty += amount;
    else if (daysPastDue <= 60) invoiceAging.thirtyOneToSixty += amount;
    else invoiceAging.sixtyPlus += amount;
  }

  const customerHealth = approvedCustomers.map((customer) => ({
    id: customer.id,
    businessName: customer.businessName,
    metrics: calculateCustomerMetrics(customer.orders, customer.tier),
  }));
  const atRiskCustomers = customerHealth.filter((customer) => customer.metrics.healthLabel === "At Risk");
  const watchCustomers = customerHealth.filter((customer) => customer.metrics.healthLabel === "Watch");
  const highReorderRisk = customerHealth.filter((customer) => customer.metrics.reorderRisk === "HIGH");
  const topAtRisk = [...customerHealth]
    .filter((customer) => customer.metrics.daysSinceLastOrder !== null)
    .sort((a, b) => (a.metrics.healthScore - b.metrics.healthScore))
    .slice(0, 5);
  const productById = new Map(activeProducts.map((product) => [product.id, product]));
  const productVelocityRows = productVelocity.map((row) => {
    const product = productById.get(row.productId);
    const units = row._sum.quantity || 0;
    const inventoryQty = product?.inventoryQty ?? null;
    return {
      productId: row.productId,
      title: product?.title || "Unknown product",
      sku: product?.sku || "-",
      units,
      revenue: Number(row._sum.totalPrice || 0),
      orderLines: row._count._all,
      inventoryQty,
      daysOfCover: inventoryQty == null || units === 0 ? null : Math.floor(inventoryQty / (units / 30)),
      stockStatus: product?.stockStatus || "UNKNOWN",
    };
  });
  const inventoryRisks = productVelocityRows.filter((row) => row.daysOfCover !== null && row.daysOfCover <= 21);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Analytics Dashboard"
        description="Operational and revenue analytics across orders, payments, customers, and sync health."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
            <p className="text-xs font-semibold uppercase text-[#4b5563]">Orders Today</p>
            <p className="mt-2 text-3xl font-bold text-[#1d4b43]">{ordersToday}</p>
            <p className="mt-1 text-xs text-[#4b5563]">Rolling day</p>
          </div>
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
            <p className="text-xs font-semibold uppercase text-[#4b5563]">Orders (7 Days)</p>
            <p className="mt-2 text-3xl font-bold text-[#1d4b43]">{orders7d}</p>
            <p className="mt-1 text-xs text-[#4b5563]">Rolling week</p>
          </div>
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
            <p className="text-xs font-semibold uppercase text-[#4b5563]">Paid Revenue (30 Days)</p>
            <p className="mt-2 text-3xl font-bold text-[#1d4b43]">${paidRevenue30d.toFixed(2)}</p>
            <p className="mt-1 text-xs text-[#4b5563]">Captured revenue only</p>
          </div>
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
            <p className="text-xs font-semibold uppercase text-[#4b5563]">All-Time Paid Revenue</p>
            <p className="mt-2 text-3xl font-bold text-[#1d4b43]">${allTimeRevenue.toFixed(2)}</p>
            <p className="mt-1 text-xs text-[#4b5563]">Lifetime total</p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Order Status Mix">
          <div className="space-y-2 text-sm">
            {typedStatusCounts.map((row) => (
              <div key={row.status} className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-2">
                <span className="font-medium text-[#111827]">{row.status}</span>
                <span className="font-semibold text-[#1d4b43]">{row._count._all}</span>
              </div>
            ))}
            {typedStatusCounts.length === 0 && <p className="text-[#4b5563]">No data yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Payment Status Mix">
          <div className="space-y-2 text-sm">
            {typedPaymentCounts.map((row) => (
              <div
                key={row.paymentStatus}
                className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-2"
              >
                <span className="font-medium text-[#111827]">{row.paymentStatus}</span>
                <span className="font-semibold text-[#1d4b43]">{row._count._all}</span>
              </div>
            ))}
            {typedPaymentCounts.length === 0 && <p className="text-[#4b5563]">No data yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Catalog Sync Health">
          <div className="space-y-2 text-sm">
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-2">
              <p className="text-xs uppercase text-[#4b5563]">Last 10 jobs</p>
              <p className="text-lg font-semibold text-[#111827]">{typedRecentSyncJobs.length}</p>
            </div>
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-2">
              <p className="text-xs uppercase text-[#4b5563]">Failures (last 10)</p>
              <p className="text-lg font-semibold text-[#111827]">{recentFailures}</p>
            </div>
            <Link href="/admin/sync-status" className="inline-block text-xs font-semibold text-[#1d4b43] hover:underline">
              Open sync status details →
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Customer Health">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase text-[#4b5563]">At risk</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{atRiskCustomers.length}</p>
            </div>
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase text-[#4b5563]">Watch</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{watchCustomers.length}</p>
            </div>
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase text-[#4b5563]">High reorder risk</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{highReorderRisk.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {topAtRisk.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <div>
                  <p className="font-semibold text-[#111827]">{customer.businessName}</p>
                  <p className="text-xs text-[#6b7280]">
                    {customer.metrics.daysSinceLastOrder} days since last order · {customer.metrics.nextTierHint}
                  </p>
                </div>
                <p className="font-semibold text-[#1d4b43]">{customer.metrics.healthScore}</p>
              </div>
            ))}
            {topAtRisk.length === 0 && <p className="text-[#4b5563]">No customer health risks yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Invoice Aging">
          <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase text-[#4b5563]">Open receivables</p>
            <p className="mt-1 text-2xl font-bold text-[#1d4b43]">${openInvoiceAmount.toFixed(2)}</p>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {[
              ["Current", invoiceAging.current],
              ["1-15 days", invoiceAging.oneToFifteen],
              ["16-30 days", invoiceAging.sixteenToThirty],
              ["31-60 days", invoiceAging.thirtyOneToSixty],
              ["60+ days", invoiceAging.sixtyPlus],
            ].map(([label, amount]) => (
              <div key={String(label)} className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <span className="text-[#111827]">{label}</span>
                <span className="font-semibold text-[#1d4b43]">${Number(amount).toFixed(2)}</span>
              </div>
            ))}
            <Link href="/admin/invoices" className="inline-block text-xs font-semibold text-[#1d4b43] hover:underline">
              Open invoice queue →
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Product Velocity & Inventory Forecast">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase text-[#4b5563]">SKUs with ≤21 days cover</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{inventoryRisks.length}</p>
            </div>
            <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase text-[#4b5563]">Tracked active SKUs</p>
              <p className="mt-1 text-2xl font-bold text-[#1d4b43]">{activeProducts.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {productVelocityRows.map((row) => (
              <div key={row.productId} className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#111827]">{row.title}</p>
                    <p className="text-xs text-[#6b7280]">
                      SKU {row.sku} · {row.units} units · ${row.revenue.toFixed(2)} revenue
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#1d4b43]">
                    {row.daysOfCover == null ? row.stockStatus : `${row.daysOfCover}d cover`}
                  </p>
                </div>
              </div>
            ))}
            {productVelocityRows.length === 0 && <p className="text-[#4b5563]">No product velocity in this window.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Multi-Touch Attribution">
          <div className="space-y-2 text-sm">
            {attributionSourceRows.map((row) => (
              <div key={row.source} className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <span className="font-semibold text-[#111827]">{row.source || "unknown"}</span>
                <span className="font-semibold text-[#1d4b43]">{row._count._all} touches</span>
              </div>
            ))}
            {attributionEventRows.length > 0 ? (
              <div className="mt-3 rounded border border-[#e7e4dc] bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Top conversion events</p>
                <div className="mt-2 space-y-1">
                  {attributionEventRows.map((row) => (
                    <div key={row.eventType} className="flex justify-between text-xs">
                      <span>{row.eventType}</span>
                      <span className="font-semibold">{row._count._all}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {attributionSourceRows.length === 0 && <p className="text-[#4b5563]">No source attribution yet.</p>}
            <Link href="/admin/outreach" className="inline-block text-xs font-semibold text-[#1d4b43] hover:underline">
              Open outreach pipeline →
            </Link>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Top Customers (Last 30 Days)">
          <div className="space-y-2 text-sm">
            {typedTopCustomers.map((row) => (
              <div
                key={row.customerId}
                className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3"
              >
                <div>
                  <p className="font-semibold text-[#111827]">
                    {customerNameById.get(row.customerId) || "Unknown customer"}
                  </p>
                  <p className="text-xs text-[#4b5563]">{row._count._all} orders</p>
                </div>
                <p className="font-semibold text-[#1d4b43]">${Number(row._sum.grandTotal || 0).toFixed(2)}</p>
              </div>
            ))}
            {typedTopCustomers.length === 0 && <p className="text-[#4b5563]">No customer order data in this window.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Order Throughput">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <span className="text-[#111827]">Orders (30 Days)</span>
              <span className="font-semibold text-[#1d4b43]">{orders30d}</span>
            </div>
            <div className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <span className="text-[#111827]">Average Orders / Day (30d)</span>
              <span className="font-semibold text-[#1d4b43]">{(orders30d / 30).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <span className="text-[#111827]">Average Paid Revenue / Day (30d)</span>
              <span className="font-semibold text-[#1d4b43]">${(paidRevenue30d / 30).toFixed(2)}</span>
            </div>
            <Link href="/admin/orders" className="inline-block text-xs font-semibold text-[#1d4b43] hover:underline">
              Drill into orders →
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
