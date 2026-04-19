"use client";

import { useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type SupportRequest = {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: string;
  assignedToId: string | null;
  createdAt: string;
  customer: {
    id: string;
    businessName: string;
    user: { email: string; name: string };
  };
};

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function AdminSupportPage() {
  const [rows, setRows] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/admin/support");
    const data = await res.json();
    setRows(data.supportRequests || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchData();
  }

  const filtered = rows.filter((r) => !statusFilter || r.status === statusFilter);

  return (
    <SectionCard title="Support Queue" description="Review and resolve customer support requests.">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="rounded bg-[#1d4b43] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-[#4b5563]">Loading support requests...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#4b5563]">No support requests found.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div key={req.id} className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#111827]">{req.subject}</p>
                    <p className="text-xs text-[#6b7280]">
                      {req.customer.businessName} • {req.customer.user.email}
                    </p>
                    <p className="mt-2 text-sm text-[#4b5563]">{req.message}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {req.type}
                    </span>
                    <select
                      value={req.status}
                      onChange={(e) => updateStatus(req.id, e.target.value)}
                      className="block rounded border border-[#e7e4dc] px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
