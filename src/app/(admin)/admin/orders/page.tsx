"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface OrderItem {
  id: string;
  productTitleSnapshot: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdAt: string;
  customer: {
    businessName: string;
    user: { email: string };
  };
  items: OrderItem[];
}

interface OrdersResponse {
  orders: Order[];
}

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID", "PARTIAL", "PAID", "REFUNDED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data: OrdersResponse = await res.json();
      setOrders(data.orders);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading orders");
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
    const matchesSearch =
      !searchTerm ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPayment && matchesSearch;
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      UNPAID: "bg-red-100 text-red-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
      REFUNDED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <SectionCard title="Order Management" description="Update statuses, tracking, and invoices.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Order Management" description="Update statuses, tracking, and invoices.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#1d4b43] focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#1d4b43] focus:outline-none"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#1d4b43] focus:outline-none"
          >
            <option value="">All Payment Status</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={fetchOrders}
            className="rounded bg-[#1d4b43] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Refresh
          </button>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#4b5563]">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Order</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Customer</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Items</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Total</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Order Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Payment</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Date</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fcfbf9]">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#111827]">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-[#111827]">{order.customer.businessName}</div>
                      <div className="text-xs text-[#4b5563]">{order.customer.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4b5563]">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#111827]">
                      ${Number(order.grandTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getPaymentColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4b5563]">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs font-semibold text-[#1d4b43] hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        <div className="border-t border-[#e7e4dc] pt-4 text-sm text-[#4b5563]">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>
    </SectionCard>
  );
}
