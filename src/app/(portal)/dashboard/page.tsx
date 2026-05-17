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

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

export default async function DashboardPage() {
  const profile = await requireApprovedBuyer();
  const customerId = profile.customerId;

  const [orderCount, activeCount, recentOrder, topItem, cart, latestInvoice, customer, latestPrediction] = await Promise.all([
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
    customerId
      ? prisma.customer.findUnique({
          where: { id: customerId },
          select: { businessName: true, tier: true, freeShippingThreshold: true },
        })
      : Promise.resolve(null),
    customerId
      ? prisma.reorderPrediction.findFirst({
          where: { customerId, status: { in: ["pending", "notified"] } },
          orderBy: [{ predictedDate: "asc" }, { createdAt: "desc" }],
          select: {
            predictedDate: true,
            confidence: true,
            reasoning: true,
            suggestedProducts: true,
            estimatedOrderValue: true,
          },
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
    ["Account tier", customer?.tier ?? "—"],
  ];

  const predictedDate = latestPrediction ? new Date(latestPrediction.predictedDate) : null;
  const daysUntilPredicted = predictedDate ? daysUntil(predictedDate) : null;
  const suggestedProducts = Array.isArray(latestPrediction?.suggestedProducts)
    ? latestPrediction.suggestedProducts.filter((item): item is string => typeof item === "string").slice(0, 3)
    : [];

  const quickActions = [
    { label: "Quick order", href: "/quick-order" },
    { label: "Browse products", href: "/products" },
    { label: "View orders", href: "/orders" },
    { label: "Quote or samples", href: "/quote" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title={customer?.businessName ? `Welcome back, ${customer.businessName}` : "Welcome back"}
        description="Here's the fastest path to your next wholesale order."
      >
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
              className="rounded-xl border border-[#d6d3cc] bg-white px-4 py-3 text-left text-sm font-medium text-[#1f2937] hover:border-[#ea580c] hover:bg-[#f9f8f5] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Smart reorder" description="Keep fast-moving chews in stock.">
          {recentOrder ? (
            <div className="space-y-3">
              {latestPrediction ? (
                <div className="rounded-xl border border-[#f59e0b]/30 bg-[#fffbeb] p-3">
                  <p className="text-sm font-semibold text-[#92400e]">
                    {daysUntilPredicted == null
                      ? "Reorder window available"
                      : daysUntilPredicted <= 0
                        ? "You may be due to reorder"
                        : `Estimated reorder window in ${daysUntilPredicted} day${daysUntilPredicted === 1 ? "" : "s"}`}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#92400e]">
                    {suggestedProducts.length > 0
                      ? `Suggested: ${suggestedProducts.join(", ")}`
                      : latestPrediction.reasoning || "Based on your previous ordering cadence."}
                  </p>
                  {latestPrediction.estimatedOrderValue ? (
                    <p className="mt-1 text-xs font-semibold text-[#92400e]">
                      Estimated replenishment: ${Number(latestPrediction.estimatedOrderValue).toFixed(2)}
                    </p>
                  ) : null}
                </div>
              ) : null}
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
              <Link href="/quick-order" className="inline-flex rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white">
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
              <Link href="/cart" className="inline-flex rounded-lg border border-[#ea580c] px-4 py-2 text-sm font-semibold text-[#ea580c]">
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
              <Link href="/invoices" className="inline-flex rounded-lg border border-[#ea580c] px-4 py-2 text-sm font-semibold text-[#ea580c]">
                View invoices
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[#4b5563]">No open invoice right now.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Account planning">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Top ordered item</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">{topItem?.productTitleSnapshot ?? "No order history yet"}</p>
          </div>
          <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Free shipping target</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              ${Number(customer?.freeShippingThreshold ?? 500).toFixed(0)} cart subtotal
            </p>
          </div>
          <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Best next action</p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {cart && cart.items.length > 0 ? "Finish open cart" : recentOrder ? "Review reorder" : "Build starter order"}
            </p>
          </div>
        </div>
      </SectionCard>

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
              className="rounded-lg border border-[#ea580c] px-3 py-1.5 text-xs font-medium text-[#ea580c] hover:bg-[#ea580c]/5"
            >
              View
            </Link>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
