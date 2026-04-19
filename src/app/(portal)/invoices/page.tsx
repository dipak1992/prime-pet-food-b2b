"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

interface Transaction {
  id: string;
  provider: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  order: {
    orderNumber: string;
  };
  transactions: Transaction[];
}

interface InvoicesResponse {
  invoices: Invoice[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string>("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    try {
      setLoading(true);
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to load invoices");
      const data: InvoicesResponse = await res.json();
      setInvoices(data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading invoices");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(invoiceId: string) {
    setDownloadingId(invoiceId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error("Failed to download invoice");
      const data = await res.json();

      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
      } else {
        // Generate PDF client-side or show preview
        alert("Invoice PDF will be generated and downloaded");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error downloading invoice");
    } finally {
      setDownloadingId("");
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      SENT: "bg-blue-100 text-blue-700",
      PARTIAL: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
      OVERDUE: "bg-red-100 text-red-700",
      VOID: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const days = Math.ceil(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  if (loading) {
    return (
      <SectionCard title="Invoices" description="View and download past invoice PDFs.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (invoices.length === 0) {
    return (
      <SectionCard title="Invoices" description="View and download past invoice PDFs.">
        <p className="text-center text-sm text-[#4b5563] py-8">No invoices yet.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Invoices" description="View and download past invoice PDFs.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-[#111827]">Invoice</th>
                <th className="px-4 py-2 text-left font-semibold text-[#111827]">Order</th>
                <th className="px-4 py-2 text-right font-semibold text-[#111827]">Amount</th>
                <th className="px-4 py-2 text-left font-semibold text-[#111827]">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-[#111827]">Due Date</th>
                <th className="px-4 py-2 text-left font-semibold text-[#111827]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e4dc]">
              {invoices.map((invoice) => {
                const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                return (
                  <tr key={invoice.id} className="hover:bg-[#fcfbf9]">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#111827]">{invoice.invoiceNumber}</span>
                      <p className="text-xs text-[#4b5563]">{formatDate(invoice.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#111827]">
                      {invoice.order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#111827]">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                      {daysUntilDue !== null && daysUntilDue > 0 && (
                        <p className="text-xs text-[#4b5563] mt-1">Due in {daysUntilDue} days</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4b5563]">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownload(invoice.id)}
                        disabled={downloadingId === invoice.id}
                        className="text-xs font-semibold text-[#1d4b43] hover:underline disabled:opacity-50"
                      >
                        {downloadingId === invoice.id ? "Downloading..." : "Download PDF"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#e7e4dc] pt-4 text-sm text-[#4b5563]">
          Total invoices: {invoices.length}
        </div>
      </div>
    </SectionCard>
  );
}
