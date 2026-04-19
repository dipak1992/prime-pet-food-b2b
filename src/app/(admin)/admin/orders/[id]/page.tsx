"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SectionCard } from "@/components/ui/SectionCard";

type OrderItem = {
  id: string;
  productTitleSnapshot: string;
  skuSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  notes: string | null;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  createdAt: string;
  customer: { businessName: string; user: { email: string; name: string | null } };
  items: OrderItem[];
  statusHistory: { id: string; status: string; note: string | null; createdAt: string }[];
};

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID", "REFUNDED"];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ status: "", paymentStatus: "", trackingNumber: "", trackingUrl: "", notes: "" });

  useEffect(() => {
    if (id) fetchOrder(id);
  }, [id]);

  async function fetchOrder(orderId: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/orders/${orderId}`);
    if (res.ok) {
      const data = await res.json();
      setOrder(data.order);
      setForm({
        status: data.order.status || "",
        paymentStatus: data.order.paymentStatus || "",
        trackingNumber: data.order.trackingNumber || "",
        trackingUrl: data.order.trackingUrl || "",
        notes: data.order.notes || "",
      });
    }
    setLoading(false);
  }

  async function saveUpdates() {
    if (!id) return;
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) await fetchOrder(id);
  }

  if (loading) {
    return <SectionCard title="Order Details"><p className="text-sm text-[#4b5563]">Loading...</p></SectionCard>;
  }

  if (!order) {
    return <SectionCard title="Order Details"><p className="text-sm text-[#4b5563]">Order not found.</p></SectionCard>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title={`Order ${order.orderNumber}`} description="Update fulfillment and payment tracking.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-[#111827]">{order.customer.businessName}</p>
            <p className="text-[#4b5563]">{order.customer.user.email}</p>
            <p className="text-xs text-[#6b7280]">Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                value={form.paymentStatus}
                onChange={(e) => setForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              >
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                value={form.trackingNumber}
                onChange={(e) => setForm((f) => ({ ...f, trackingNumber: e.target.value }))}
                placeholder="Tracking number"
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
              <input
                value={form.trackingUrl}
                onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))}
                placeholder="Tracking URL"
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Internal notes"
              className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            />
            <button
              onClick={saveUpdates}
              className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
            >
              Save updates
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Line Items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
              <tr>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Unit</th>
                <th className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e4dc]">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-[#f7f7fb]">
                  <td className="px-3 py-3">{item.productTitleSnapshot}</td>
                  <td className="px-3 py-3 text-[#4b5563]">{item.skuSnapshot || "-"}</td>
                  <td className="px-3 py-3 text-right">{item.quantity}</td>
                  <td className="px-3 py-3 text-right">${Number(item.unitPrice).toFixed(2)}</td>
                  <td className="px-3 py-3 text-right font-semibold">${Number(item.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">Subtotal: ${order.subtotal.toFixed(2)}</div>
          <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">Shipping: ${order.shippingTotal.toFixed(2)}</div>
          <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">Tax: ${order.taxTotal.toFixed(2)}</div>
          <div className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3 font-semibold">Grand Total: ${order.grandTotal.toFixed(2)}</div>
        </div>
      </SectionCard>

      <SectionCard title="Status History">
        <div className="space-y-2 text-sm">
          {order.statusHistory.length === 0 ? (
            <p className="text-[#4b5563]">No status history yet.</p>
          ) : (
            order.statusHistory.map((entry) => (
              <div key={entry.id} className="rounded border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <p className="font-semibold text-[#111827]">{entry.status}</p>
                <p className="text-xs text-[#6b7280]">{new Date(entry.createdAt).toLocaleString()}</p>
                {entry.note ? <p className="mt-1 text-[#4b5563]">{entry.note}</p> : null}
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
