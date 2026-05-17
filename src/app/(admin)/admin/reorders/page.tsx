"use client";

import { useCallback, useEffect, useState } from "react";
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
  confidence: number | null;
  reasoning: string | null;
  suggestedProducts: string[];
  estimatedOrderValue: number | null;
  urgency: "LOW" | "MEDIUM" | "HIGH";
};

function urgencyClass(urgency: string) {
  if (urgency === "HIGH") return "bg-red-100 text-red-700";
  if (urgency === "MEDIUM") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

export default function AdminReordersPage() {
  const [rows, setRows] = useState<ReorderCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reorders");
    const data = await res.json();
    setRows(data.reorders || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function sendReminder(row: ReorderCandidate) {
    setSendingId(row.id);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/reorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: row.id }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Could not send reminder");

      setMessage(`Reminder sent to ${row.email}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reminder");
    } finally {
      setSendingId("");
    }
  }

  return (
    <SectionCard
      title="Reorder Opportunities"
      description="Customers with 2+ orders, reorder timing, suggested products, and one-click reminders."
    >
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
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
                <th className="px-3 py-2 text-left">Recommendation</th>
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
                  <td className="px-3 py-3 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${urgencyClass(row.urgency)}`}>
                      {row.daysSinceLastOrder}d
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-xs font-semibold text-[#111827]">
                      {row.suggestedProducts?.slice(0, 2).join(", ") || "Previous best sellers"}
                    </p>
                    <p className="mt-1 text-[11px] text-[#6b7280]">
                      Due {new Date(row.suggestedReorderDate).toLocaleDateString()}
                      {row.confidence ? ` · ${Math.round(row.confidence * 100)}% confidence` : ""}
                      {row.estimatedOrderValue ? ` · $${Number(row.estimatedOrderValue).toFixed(0)} est.` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => sendReminder(row)}
                      disabled={sendingId === row.id}
                      className="rounded bg-[#1d4b43] px-3 py-1 text-xs font-semibold text-white hover:bg-[#163836] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingId === row.id ? "Sending..." : "Send Reminder"}
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
