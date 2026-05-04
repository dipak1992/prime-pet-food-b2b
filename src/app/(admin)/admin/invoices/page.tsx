"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    customer: { businessName: string; user: { email: string } };
  };
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchInvoices() {
    setLoading(true);
    const res = await fetch("/api/admin/invoices");
    const data = await res.json();
    setInvoices(data.invoices || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function markPaid(invoiceId: string) {
    const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID", paidAt: new Date().toISOString() }),
    });

    if (res.ok) {
      await fetchInvoices();
    }
  }

  async function sendInvoice(invoiceId: string) {
    const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT" }),
    });

    if (res.ok) {
      await fetchInvoices();
    }
  }

  const filtered = invoices.filter((inv) => !statusFilter || inv.status === statusFilter);

  return (
    <SectionCard title="Invoices" description="Track invoice status and collections.">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="SENT">SENT</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="VOID">VOID</option>
          </select>
          <button
            onClick={fetchInvoices}
            className="rounded bg-[#1d4b43] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#4b5563]">Loading invoices...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#4b5563]">No invoices found.</p>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
                <tr>
                  <th className="px-3 py-2 text-left">Invoice</th>
                  <th className="px-3 py-2 text-left">Order</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Due</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc]">
                {filtered.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[#f7f7fb]">
                    <td className="px-3 py-3 font-medium">{invoice.invoiceNumber}</td>
                    <td className="px-3 py-3">
                      <Link href={`/admin/orders/${invoice.order.id}`} className="text-[#1d4b43] hover:underline">
                        {invoice.order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-[#111827]">{invoice.order.customer.businessName}</p>
                      <p className="text-xs text-[#6b7280]">{invoice.order.customer.user.email}</p>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold">${invoice.amount.toFixed(2)}</td>
                    <td className="px-3 py-3">{invoice.status}</td>
                    <td className="px-3 py-3 text-xs text-[#6b7280]">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {invoice.status === "PAID" ? (
                        <span className="text-xs text-green-700">Paid</span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {invoice.status === "DRAFT" && (
                            <button
                              onClick={() => sendInvoice(invoice.id)}
                              className="rounded border border-[#1d4b43] px-3 py-1 text-xs font-semibold text-[#1d4b43] hover:bg-[#f0f7f5]"
                            >
                              Send invoice
                            </button>
                          )}
                          <button
                            onClick={() => markPaid(invoice.id)}
                            className="rounded border border-[#e7e4dc] px-3 py-1 text-xs font-semibold hover:bg-[#f3f1eb]"
                          >
                            Mark paid
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {filtered.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#111827]">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-[#6b7280]">{invoice.order.orderNumber}</p>
                  </div>
                  <p className="font-semibold text-[#111827]">${invoice.amount.toFixed(2)}</p>
                </div>
                <div className="mt-3 space-y-1 text-sm text-[#4b5563]">
                  <p>{invoice.order.customer.businessName}</p>
                  <p className="text-xs">{invoice.order.customer.user.email}</p>
                  <p className="text-xs">
                    {invoice.status} · Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                {invoice.status !== "PAID" && (
                  <div className="mt-3 flex gap-2">
                    {invoice.status === "DRAFT" && (
                      <button
                        onClick={() => sendInvoice(invoice.id)}
                        className="flex-1 rounded border border-[#1d4b43] px-3 py-2 text-xs font-semibold text-[#1d4b43]"
                      >
                        Send invoice
                      </button>
                    )}
                    <button
                      onClick={() => markPaid(invoice.id)}
                      className="flex-1 rounded border border-[#e7e4dc] px-3 py-2 text-xs font-semibold"
                    >
                      Mark paid
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}
