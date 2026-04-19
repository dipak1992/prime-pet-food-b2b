import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
