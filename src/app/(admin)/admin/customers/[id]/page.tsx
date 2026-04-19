"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SectionCard } from "@/components/ui/SectionCard";

type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
};

type Customer = {
  id: string;
  businessName: string;
  businessType: string;
  tier: string;
  accountStatus: string;
  defaultTerms: string;
  freeShippingThreshold: number;
  createdAt: string;
  user: { name: string; email: string };
  orders: CustomerOrder[];
};

const TIERS = ["BRONZE", "SILVER", "GOLD"];
const ACCOUNT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ tier: "", accountStatus: "", defaultTerms: "", freeShippingThreshold: "" });

  useEffect(() => {
    if (id) fetchCustomer(id);
  }, [id]);

  async function fetchCustomer(customerId: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/customers/${customerId}`);
    if (res.ok) {
      const data = await res.json();
      setCustomer(data.customer);
      setForm({
        tier: data.customer.tier,
        accountStatus: data.customer.accountStatus,
        defaultTerms: data.customer.defaultTerms,
        freeShippingThreshold: String(data.customer.freeShippingThreshold),
      });
    }
    setLoading(false);
  }

  async function saveCustomer() {
    if (!id) return;
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier: form.tier,
        accountStatus: form.accountStatus,
        defaultTerms: form.defaultTerms,
        freeShippingThreshold: Number(form.freeShippingThreshold),
      }),
    });

    if (res.ok) await fetchCustomer(id);
  }

  if (loading) {
    return <SectionCard title="Customer Profile"><p className="text-sm text-[#4b5563]">Loading...</p></SectionCard>;
  }

  if (!customer) {
    return <SectionCard title="Customer Profile"><p className="text-sm text-[#4b5563]">Customer not found.</p></SectionCard>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title={customer.businessName} description="Customer account profile and controls.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-[#111827]">{customer.user.name}</p>
            <p className="text-[#4b5563]">{customer.user.email}</p>
            <p className="text-[#4b5563]">{customer.businessType}</p>
          </div>

          <div className="space-y-2">
            <div className="grid gap-2 md:grid-cols-2">
              <select
                value={form.tier}
                onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
              <select
                value={form.accountStatus}
                onChange={(e) => setForm((f) => ({ ...f, accountStatus: e.target.value }))}
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              >
                {ACCOUNT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                value={form.defaultTerms}
                onChange={(e) => setForm((f) => ({ ...f, defaultTerms: e.target.value }))}
                placeholder="Default terms"
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
              <input
                value={form.freeShippingThreshold}
                onChange={(e) => setForm((f) => ({ ...f, freeShippingThreshold: e.target.value }))}
                placeholder="Free shipping threshold"
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={saveCustomer}
              className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
            >
              Save customer
            </button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Recent Orders" description="Most recent orders and payment status.">
        {customer.orders.length === 0 ? (
          <p className="text-sm text-[#4b5563]">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
                <tr>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Payment</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc]">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f7f7fb]">
                    <td className="px-3 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-3 py-3">{order.status}</td>
                    <td className="px-3 py-3">{order.paymentStatus}</td>
                    <td className="px-3 py-3 text-right font-semibold">${order.grandTotal.toFixed(2)}</td>
                    <td className="px-3 py-3 text-xs text-[#6b7280]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
