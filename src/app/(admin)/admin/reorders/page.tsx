"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type ReorderCandidate = {
  id: string;
  businessName: string;
  email: string;
  totalOrders: number;
  lifetimeValue: number;
  lastOrderDate: string;
  avgIntervalDays: number;
  suggestedReorderDate: string;
  daysSinceLastOrder: number;
};

export default function AdminReordersPage() {
  const [rows, setRows] = useState<ReorderCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/admin/reorders");
    const data = await res.json();
    setRows(data.reorders || []);
    setLoading(false);
  }

  function sendReminder(email: string) {
    window.alert(`Reminder queued for ${email}`);
  }

  return (
    <SectionCard
      title="Reorder Opportunities"
      description="Customers with 2+ orders and no purchase in the last 30 days."
    >
      {loading ? (
        <p className="text-sm text-[#4b5563]">Loading reorder opportunities...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[#4b5563]">No reorder opportunities right now.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
              <tr>
                <th className="px-3 py-2 text-left">Business</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-right">Orders</th>
                <th className="px-3 py-2 text-right">LTV</th>
                <th className="px-3 py-2 text-left">Last Order</th>
                <th className="px-3 py-2 text-right">Avg Cycle</th>
                <th className="px-3 py-2 text-right">Days Since</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e4dc]">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#f7f7fb]">
                  <td className="px-3 py-3 font-medium">{row.businessName}</td>
                  <td className="px-3 py-3 text-[#4b5563]">{row.email}</td>
                  <td className="px-3 py-3 text-right">{row.totalOrders}</td>
                  <td className="px-3 py-3 text-right font-semibold">${Number(row.lifetimeValue).toFixed(2)}</td>
                  <td className="px-3 py-3 text-xs text-[#6b7280]">
                    {new Date(row.lastOrderDate).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 text-right">{Math.round(row.avgIntervalDays || 0)}d</td>
                  <td className="px-3 py-3 text-right">{row.daysSinceLastOrder}d</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => sendReminder(row.email)}
                      className="rounded bg-[#1d4b43] px-3 py-1 text-xs font-semibold text-white hover:bg-[#163836]"
                    >
                      Send Reminder
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}
