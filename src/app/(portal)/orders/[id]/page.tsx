import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { SectionCard } from "@/components/ui/SectionCard";
import { ChevronLeft, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  UNPAID: "bg-yellow-100 text-yellow-800",
  OVERDUE: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireApprovedBuyer();
  const { id } = await params;

  if (!profile.customerId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: { id, customerId: profile.customerId },
    include: {
      items: { include: { product: { select: { id: true, title: true } } } },
      invoice: true,
      customer: { include: { addresses: { where: { isDefault: true }, take: 1 } } },
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddr = order.customer.addresses[0];

  return (
    <div className="max-w-2xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex items-center gap-2">
        <Link
          href="/orders"
          className="flex items-center gap-1 text-sm text-[#6b7280] hover:text-[#1d4b43]"
        >
          <ChevronLeft className="size-4" />
          Back to Orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#111827]">Order #{order.orderNumber}</h1>
          <p className="mt-0.5 text-sm text-[#6b7280]">
            Placed {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
            {order.status}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_COLORS[order.paymentStatus] ?? "bg-gray-100 text-gray-700"}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Items */}
      <SectionCard title="Items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e7e4dc] text-left text-xs font-semibold uppercase text-[#6b7280]">
                <th className="pb-2 pr-4">Product</th>
                <th className="pb-2 pr-4 text-right">Qty</th>
                <th className="pb-2 pr-4 text-right">Unit</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f4f6]">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-4 font-medium text-[#111827]">
                    {item.productTitleSnapshot}
                  </td>
                  <td className="py-2 pr-4 text-right text-[#374151]">{item.quantity}</td>
                  <td className="py-2 pr-4 text-right text-[#374151]">
                    ${Number(item.unitPrice).toFixed(2)}
                  </td>
                  <td className="py-2 text-right font-medium text-[#111827]">
                    ${Number(item.totalPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 space-y-1 border-t border-[#e7e4dc] pt-3 text-sm">
          {Number(order.discountTotal) > 0 && (
            <div className="flex justify-between text-[#374151]">
              <span>Discount</span>
              <span>-${Number(order.discountTotal).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#374151]">
            <span>Shipping</span>
            <span>${Number(order.shippingTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[#374151]">
            <span>Tax</span>
            <span>${Number(order.taxTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-[#111827]">
            <span>Total</span>
            <span>${Number(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </SectionCard>

      {/* Shipping & Tracking */}
      <div className="grid gap-6 sm:grid-cols-2">
        {shippingAddr && (
          <SectionCard title="Shipping address">
            <div className="text-sm text-[#374151] space-y-0.5">
              <p>{shippingAddr.line1}</p>
              {shippingAddr.line2 && <p>{shippingAddr.line2}</p>}
              <p>{shippingAddr.city}, {shippingAddr.state} {shippingAddr.zip}</p>
              {shippingAddr.country !== "US" && <p>{shippingAddr.country}</p>}
            </div>
          </SectionCard>
        )}

        <SectionCard title="Tracking">
          {order.trackingNumber ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium text-[#111827]">{order.trackingNumber}</p>
              {order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1d4b43] hover:underline"
                >
                  Track shipment <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#6b7280]">Not yet assigned</p>
          )}
        </SectionCard>
      </div>

      {/* Invoice */}
      {order.invoice && (
        <SectionCard title="Invoice">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-[#111827]">#{order.invoice.invoiceNumber}</p>
              <p className="text-[#6b7280]">
                {order.invoice.status}
                {order.invoice.dueDate
                  ? ` · Due ${new Date(order.invoice.dueDate).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {order.invoice.pdfUrl && (
                <a
                  href={order.invoice.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg border border-[#1d4b43] px-3 py-1.5 text-xs font-medium text-[#1d4b43] hover:bg-[#1d4b43]/5"
                >
                  Download PDF <ExternalLink className="size-3" />
                </a>
              )}
              <Link
                href={`/invoices/${order.invoice.id}`}
                className="rounded-lg border border-[#d1d5db] px-3 py-1.5 text-xs font-medium text-[#374151] hover:bg-[#f3f4f6]"
              >
                View
              </Link>
            </div>
          </div>
        </SectionCard>
      )}

      {order.notes && (
        <SectionCard title="Notes">
          <p className="text-sm text-[#374151]">{order.notes}</p>
        </SectionCard>
      )}
    </div>
  );
}

