import Link from "next/link";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";
import { ReorderLastButton } from "@/components/portal/ReorderLastButton";

function daysAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diff === 0) return "today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default async function DashboardPage() {
  const profile = await requireApprovedBuyer();
  const customerId = profile.customerId;

  const [orderCount, activeCount, recentOrder, topItem, cart, latestInvoice] = await Promise.all([
    customerId
      ? prisma.order.count({ where: { customerId } })
      : Promise.resolve(0),
    customerId
      ? prisma.order.count({
          where: { customerId, status: { in: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"] } },
        })
      : Promise.resolve(0),
    customerId
      ? prisma.order.findFirst({
          where: { customerId },
          orderBy: { createdAt: "desc" },
          select: { id: true, orderNumber: true, createdAt: true, status: true, grandTotal: true },
        })
      : Promise.resolve(null),
    customerId
      ? prisma.orderItem.findFirst({
          where: { order: { customerId } },
          orderBy: { quantity: "desc" },
          select: { productTitleSnapshot: true },
        })
      : Promise.resolve(null),
    customerId
      ? prisma.cart.findFirst({
          where: { customerId, status: "ACTIVE" },
          include: { items: true },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve(null),
    customerId
      ? prisma.invoice.findFirst({
          where: { order: { customerId }, status: { in: ["DRAFT", "SENT", "PARTIAL", "OVERDUE"] } },
          orderBy: { createdAt: "desc" },
          select: { id: true, invoiceNumber: true, amount: true, status: true, dueDate: true },
        })
      : Promise.resolve(null),
  ]);

  const lastOrderLabel = recentOrder
    ? daysAgo(new Date(recentOrder.createdAt))
    : "—";

  const stats = [
    ["Last order", lastOrderLabel],
    ["Total orders", String(orderCount)],
    ["Active orders", String(activeCount)],
    ["Top product", topItem?.productTitleSnapshot ?? "—"],
  ];

  const quickActions = [
    { label: "Quick order", href: "/quick-order" },
    { label: "Browse products", href: "/products" },
    { label: "View orders", href: "/orders" },
    { label: "Quote or samples", href: "/quote" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="Welcome back" description="Here's a quick overview of your account.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
              <p className="mt-1 text-base font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Quick actions">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-[#d6d3cc] bg-white px-4 py-3 text-left text-sm font-medium text-[#1f2937] hover:border-[#1d4b43] hover:bg-[#f9f8f5] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Reorder module" description="Keep fast-moving chews in stock.">
          {recentOrder ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <p className="text-sm font-semibold text-[#111827]">Last order #{recentOrder.orderNumber}</p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  Placed {lastOrderLabel} · ${Number(recentOrder.grandTotal).toFixed(2)}
                </p>
              </div>
              <ReorderLastButton orderId={recentOrder.id} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#4b5563]">No previous order to reorder yet.</p>
              <Link href="/quick-order" className="inline-flex rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white">
                Start first order
              </Link>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Open cart">
          {cart && cart.items.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[#4b5563]">
                {cart.items.length} SKU{cart.items.length === 1 ? "" : "s"} waiting in your cart.
              </p>
              <Link href="/cart" className="inline-flex rounded-lg border border-[#1d4b43] px-4 py-2 text-sm font-semibold text-[#1d4b43]">
                Review cart
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[#4b5563]">Your cart is clear.</p>
              <Link href="/products" className="inline-flex rounded-lg border border-[#d6d3cc] px-4 py-2 text-sm font-semibold text-[#111827]">
                Browse catalog
              </Link>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Invoice status">
          {latestInvoice ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[#111827]">{latestInvoice.invoiceNumber}</p>
              <p className="text-xs text-[#6b7280]">
                {latestInvoice.status} · ${Number(latestInvoice.amount).toFixed(2)}
                {latestInvoice.dueDate ? ` · Due ${new Date(latestInvoice.dueDate).toLocaleDateString()}` : ""}
              </p>
              <Link href="/invoices" className="inline-flex rounded-lg border border-[#1d4b43] px-4 py-2 text-sm font-semibold text-[#1d4b43]">
                View invoices
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[#4b5563]">No open invoice right now.</p>
          )}
        </SectionCard>
      </div>

      {recentOrder && (
        <SectionCard title="Recent order">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#111827]">#{recentOrder.orderNumber}</p>
              <p className="text-xs text-[#6b7280]">
                {recentOrder.status} · ${Number(recentOrder.grandTotal).toFixed(2)}
              </p>
            </div>
            <Link
              href={`/orders/${recentOrder.id}`}
              className="rounded-lg border border-[#1d4b43] px-3 py-1.5 text-xs font-medium text-[#1d4b43] hover:bg-[#1d4b43]/5"
            >
              View
            </Link>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
