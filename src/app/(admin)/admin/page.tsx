import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

async function safelyLoad<T>(label: string, loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(`[admin dashboard] Failed to load ${label}:`, error);
    return fallback;
  }
}

export default async function AdminHomePage() {
  const pendingApplications = await safelyLoad(
    "pending applications",
    () => prisma.wholesaleApplication.count({ where: { status: "PENDING" } }),
    0,
  );

  const openOrders = await safelyLoad(
    "open orders",
    () => prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"] } } }),
    0,
  );

  const customers = await safelyLoad("customers", () => prisma.customer.count(), 0);

  const totalRevenue = await safelyLoad(
    "total revenue",
    () =>
      prisma.order
        .aggregate({
          where: { paymentStatus: "PAID" },
          _sum: { grandTotal: true },
        })
        .then((r) => r._sum.grandTotal || 0),
    0,
  );

  const recentOrders = await safelyLoad(
    "recent orders",
    () =>
      prisma.order.findMany({
        where: { status: { in: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          customer: { select: { businessName: true } },
          items: { select: { productTitleSnapshot: true } },
          status: true,
          grandTotal: true,
        },
      }),
    [],
  );

  const syncJobs = await safelyLoad(
    "sync jobs",
    () =>
      prisma.productSyncJob.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    [],
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SectionCard title="Pending Approvals">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-[#1d4b43]">{pendingApplications}</p>
            <Link
              href="/admin/applications"
              className="text-xs font-semibold text-[#1d4b43] hover:underline"
            >
              Review → 
            </Link>
          </div>
        </SectionCard>
        <SectionCard title="Active Orders">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-[#1d4b43]">{openOrders}</p>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-[#1d4b43] hover:underline"
            >
              View all →
            </Link>
          </div>
        </SectionCard>
        <SectionCard title="Total Customers">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-[#1d4b43]">{customers}</p>
            <Link
              href="/admin/customers"
              className="text-xs font-semibold text-[#1d4b43] hover:underline"
            >
              View all →
            </Link>
          </div>
        </SectionCard>
        <SectionCard title="Revenue (Paid)">
          <div className="space-y-2">
            <p className="text-4xl font-bold text-[#1d4b43]">${Number(totalRevenue).toFixed(2)}</p>
            <p className="text-xs text-[#4b5563]">all-time</p>
          </div>
        </SectionCard>
      </div>

      {/* Recent Orders & Sync Jobs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <SectionCard title="Recent Orders">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#4b5563]">No recent orders.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3 text-sm hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#111827]">{order.orderNumber}</p>
                      <p className="text-xs text-[#4b5563]">{order.customer?.businessName}</p>
                    </div>
                    <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#4b5563]">
                    <p>{order.items[0]?.productTitleSnapshot}
                      {order.items.length > 1 && ` +${order.items.length - 1} more`}</p>
                    <p className="text-xs text-[#6b7280] mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right font-semibold text-[#111827] text-sm mt-2">
                    ${Number(order.grandTotal).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Product Sync Status */}
        <SectionCard title="Recent Sync Jobs">
          {syncJobs.length === 0 ? (
            <p className="text-sm text-[#4b5563]">No sync jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {syncJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3 text-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-[#111827]">Shopify Sync</p>
                      <p className="text-xs text-[#4b5563]">
                        {job.recordsUpserted} products synced
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        job.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : job.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b7280]">{formatDate(job.createdAt)}</p>
                  {job.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">Error: {job.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link
            href="/admin/sync-status"
            className="mt-3 inline-block text-xs font-semibold text-[#1d4b43] hover:underline"
          >
            View sync status →
          </Link>
        </SectionCard>
      </div>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
          <Link
            href="/admin/applications"
            className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0] transition-colors"
          >
            Review Applications
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0] transition-colors"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/customers"
            className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0] transition-colors"
          >
            View Customers
          </Link>
          <Link
            href="/admin/analytics"
            className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0] transition-colors"
          >
            Open Analytics
          </Link>
          <Link
            href="/admin/sync-status"
            className="rounded-lg border border-[#1d4b43] bg-[#1d4b43] p-4 text-center text-sm font-semibold text-white hover:bg-[#163836] transition-colors"
          >
            Trigger Sync
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
