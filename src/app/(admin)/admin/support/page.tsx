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
const REQUEST_TYPES = ["SAMPLE_REQUEST", "CUSTOM_PRICING", "SALES_REP", "GENERAL"];

function daysOpen(createdAt: string) {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
}

function getPipelineLabel(type: string) {
  const requestType = type.toUpperCase();
  if (requestType.includes("DISTRIBUTOR")) return "Distributor";
  if (requestType.includes("PRIVATE_LABEL")) return "Private label";
  if (type === "CUSTOM_PRICING") return "Quote";
  if (type === "SAMPLE_REQUEST") return "Sample";
  if (type === "SALES_REP") return "Sales";
  if (type === "GENERAL") return "Support";
  return "Support";
}

function getSlaStatus(req: SupportRequest) {
  if (req.status === "RESOLVED" || req.status === "CLOSED") return { label: "Done", className: "bg-green-100 text-green-700" };
  const age = daysOpen(req.createdAt);
  if (age >= 2) return { label: "Over SLA", className: "bg-red-100 text-red-700" };
  if (age >= 1) return { label: "Due today", className: "bg-amber-100 text-amber-700" };
  return { label: "New", className: "bg-blue-100 text-blue-700" };
}

function extractLine(message: string, label: string) {
  const line = message.split("\n").find((entry) => entry.toLowerCase().startsWith(label.toLowerCase()));
  return line?.split(":").slice(1).join(":").trim() || "";
}

function generateQuoteSummary(req: SupportRequest) {
  const requestType = extractLine(req.message, "Request type") || req.type;
  const need = extractLine(req.message, "Business need") || req.subject;
  const volume = extractLine(req.message, "Expected monthly volume") || "volume not provided";
  const timeline = extractLine(req.message, "Timeline") || "timeline not provided";
  const skus = extractLine(req.message, "Target SKUs / products") || "assortment not specified";
  return `${requestType} request from ${req.customer.businessName}. Need: ${need}. Volume: ${volume}. Timeline: ${timeline}. Products: ${skus}.`;
}

function generateReplyDraft(req: SupportRequest) {
  const need = extractLine(req.message, "Business need") || "your request";
  const timeline = extractLine(req.message, "Timeline") || "your timeline";
  if (req.type === "SAMPLE_REQUEST") {
    return `Hi ${req.customer.user.name},\n\nThanks for the sample request. We reviewed the note about ${need}. We can help with a sample pack and will confirm the best shipping path for ${timeline}.\n\nCan you confirm the best shipping contact and whether this is for retail resale, daycare use, or customer samples?\n\nPrime Pet Food Wholesale`;
  }
  if (req.type === "CUSTOM_PRICING") {
    return `Hi ${req.customer.user.name},\n\nThanks for the custom pricing request. Based on your note about ${need}, we can review a volume quote and recommended case mix.\n\nCan you confirm your expected monthly case volume and whether you want best sellers only or a mixed assortment?\n\nPrime Pet Food Wholesale`;
  }
  return `Hi ${req.customer.user.name},\n\nThanks for reaching out. We reviewed your request about ${need} and will follow up with next steps.\n\nPrime Pet Food Wholesale`;
}

export default function AdminSupportPage() {
  const [rows, setRows] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

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

  const quoteRows = rows.filter((r) => ["SAMPLE_REQUEST", "CUSTOM_PRICING", "SALES_REP"].includes(r.type));
  const filtered = rows.filter((r) => {
    const matchesStatus = !statusFilter || r.status === statusFilter;
    const matchesType = !typeFilter || r.type === typeFilter;
    return matchesStatus && matchesType;
  });
  const openPipelineValue = quoteRows.filter((r) => ["OPEN", "IN_PROGRESS"].includes(r.status)).length;
  const overSla = rows.filter((r) => getSlaStatus(r).label === "Over SLA").length;

  return (
    <SectionCard title="Quote & support pipeline" description="Prioritize samples, custom pricing, sales requests, and support by SLA.">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Open sales requests</p>
            <p className="mt-1 text-2xl font-bold text-[#1d4b43]">{openPipelineValue}</p>
          </div>
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Sample requests</p>
            <p className="mt-1 text-2xl font-bold text-[#1d4b43]">{quoteRows.filter((r) => r.type === "SAMPLE_REQUEST").length}</p>
          </div>
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Custom quotes</p>
            <p className="mt-1 text-2xl font-bold text-[#1d4b43]">{quoteRows.filter((r) => r.type === "CUSTOM_PRICING").length}</p>
          </div>
          <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#6b7280]">Over SLA</p>
            <p className="mt-1 text-2xl font-bold text-red-700">{overSla}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
          >
            <option value="">All request types</option>
            {REQUEST_TYPES.map((s) => (
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
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {[
                        ["Need", extractLine(req.message, "Business need")],
                        ["Volume", extractLine(req.message, "Expected monthly volume")],
                        ["Timeline", extractLine(req.message, "Timeline")],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded border border-[#e7e4dc] bg-white px-3 py-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">{label}</p>
                          <p className="mt-1 text-xs text-[#111827]">{value || "—"}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-[#4b5563]">{req.message}</p>
                    {["SAMPLE_REQUEST", "CUSTOM_PRICING", "SALES_REP"].includes(req.type) ? (
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg border border-[#dbeafe] bg-blue-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">AI-style summary</p>
                          <p className="mt-1 text-xs leading-5 text-blue-900">{generateQuoteSummary(req)}</p>
                        </div>
                        <div className="rounded-lg border border-[#dcfce7] bg-green-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Reply draft</p>
                          <pre className="mt-1 whitespace-pre-wrap text-xs leading-5 text-green-900">{generateReplyDraft(req)}</pre>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {getPipelineLabel(req.type)}
                    </span>
                    <span className={`block rounded-full px-2 py-0.5 text-center text-xs font-semibold ${getSlaStatus(req).className}`}>
                      {getSlaStatus(req).label}
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
