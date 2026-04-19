"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface OrderItem {
  productTitleSnapshot: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [reorderingId, setReorderingId] = useState<string>("");
  const [reorderSuccess, setReorderSuccess] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data: OrdersResponse = await res.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleReorder(orderId: string) {
    setReorderingId(orderId);
    setReorderSuccess("");
    try {
      const res = await fetch("/api/cart/reorder-last", {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Reorder failed");
      }

      const result = await res.json();
      setReorderSuccess(result.message);
      setTimeout(() => setReorderSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error reordering");
    } finally {
      setReorderingId("");
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      PACKED: "bg-purple-100 text-purple-700",
      SHIPPED: "bg-indigo-100 text-indigo-700",
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <SectionCard title="Orders" description="Track every wholesale order in one place.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (orders.length === 0) {
    return (
      <SectionCard title="Orders" description="Track every wholesale order in one place.">
        <div className="text-center py-12">
          <p className="text-sm text-[#4b5563] mb-4">No orders yet.</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Start Shopping
          </Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Orders" description="Track every wholesale order in one place.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {reorderSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {reorderSuccess}
            <Link href="/cart" className="ml-2 font-semibold hover:underline">
              View Cart →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-[#111827]">{order.orderNumber}</h3>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#4b5563]">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""} • Placed {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#111827]">
                    ${(Number(order.grandTotal) / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-[#4b5563]">{order.paymentStatus}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="mb-3 pb-3 border-b border-[#e7e4dc]">
                <ul className="space-y-1 text-xs text-[#4b5563]">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <li key={idx}>
                      {item.productTitleSnapshot} (qty: {item.quantity})
                    </li>
                  ))}
                  {order.items.length > 3 && (
                    <li className="font-medium">+{order.items.length - 3} more items</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleReorder(order.id)}
                  disabled={reorderingId === order.id}
                  className="flex-1 rounded-lg border border-[#1d4b43] px-3 py-2 text-sm font-semibold text-[#1d4b43] hover:bg-[#f5f3f0] disabled:opacity-50"
                >
                  {reorderingId === order.id ? "Reordering..." : "Reorder"}
                </button>
                <Link
                  href={`/orders/${order.id}`}
                  className="flex-1 rounded-lg border border-[#e7e4dc] px-3 py-2 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
