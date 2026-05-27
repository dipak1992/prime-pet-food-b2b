"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Lead {
  id: string;
  businessName: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  source: string;
  status: string;
  leadScore: number | null;
  createdAt: string;
  emails: { id: string; subject: string; createdAt: string }[];
  _count: { emails: number; activities: number };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreBadge(score: number | null) {
  if (score === null || score === undefined) {
    return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">—</span>;
  }
  if (score >= 70) {
    return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">{score}</span>;
  }
  if (score >= 50) {
    return <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">{score}</span>;
  }
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{score}</span>;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    NEW: "bg-yellow-100 text-yellow-700",
    CONTACTED: "bg-blue-100 text-blue-700",
    QUALIFIED: "bg-green-100 text-green-700",
    CONVERTED: "bg-emerald-100 text-emerald-800",
    ARCHIVED: "bg-gray-100 text-gray-500",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-500";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* Filters */
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [minScoreFilter, setMinScoreFilter] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (minScoreFilter) params.set("minScore", minScoreFilter);

      const res = await fetch(`/api/admin/ai/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const json = await res.json();
      setLeads(json.leads ?? []);
    } catch {
      setMessage({ type: "error", text: "Failed to load leads." });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter, minScoreFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function handleRun(agentId: string, label: string) {
    setRunning(agentId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setMessage({ type: "success", text: `${label} completed successfully.` });
      await fetchLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Run failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setRunning(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/ai" className="text-sm text-[#4b5563] hover:underline">
              AI Growth Center
            </Link>
            <span className="text-sm text-[#4b5563]">/</span>
            <h1 className="text-2xl font-bold text-[#1d4b43]">AI Lead Finder</h1>
          </div>
          <p className="mt-1 text-sm text-[#4b5563]">
            Discover and qualify wholesale leads with AI-powered prospecting.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleRun("lead_finder", "Lead Finder")}
            disabled={!!running}
            className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
          >
            {running === "lead_finder" ? "Finding…" : "Find Leads"}
          </button>
          <button
            onClick={() => handleRun("lead_qualifier", "Lead Qualifier")}
            disabled={!!running}
            className="rounded border border-[#1d4b43] bg-white px-4 py-2 text-sm font-semibold text-[#1d4b43] hover:bg-[#f7f7fb] disabled:opacity-50"
          >
            {running === "lead_qualifier" ? "Qualifying…" : "Qualify Leads"}
          </button>
        </div>
      </div>

      {/* ---- Message banner ---- */}
      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ---- Filters ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border border-[#e7e4dc] bg-white px-3 py-2 text-sm text-[#4b5563]"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONVERTED">Converted</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded border border-[#e7e4dc] bg-white px-3 py-2 text-sm text-[#4b5563]"
        >
          <option value="">All Sources</option>
          <option value="AI_LEAD_FINDER">AI Lead Finder</option>
          <option value="manual">Manual</option>
          <option value="website">Website</option>
        </select>

        <select
          value={minScoreFilter}
          onChange={(e) => setMinScoreFilter(e.target.value)}
          className="rounded border border-[#e7e4dc] bg-white px-3 py-2 text-sm text-[#4b5563]"
        >
          <option value="">Any Score</option>
          <option value="70">70+ (Hot)</option>
          <option value="50">50+ (Warm)</option>
          <option value="30">30+ (Cool)</option>
        </select>
      </div>

      {/* ---- Table ---- */}
      <div className="overflow-x-auto rounded-xl border border-[#e7e4dc] bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d4b43] border-t-transparent" />
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#4b5563]">
            No leads found. Try adjusting filters or run the Lead Finder agent.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e7e4dc] bg-[#f7f7fb]">
                <th className="px-4 py-3 font-semibold text-[#1d4b43]">Business</th>
                <th className="px-4 py-3 font-semibold text-[#1d4b43]">Location</th>
                <th className="px-4 py-3 font-semibold text-[#1d4b43]">Score</th>
                <th className="px-4 py-3 font-semibold text-[#1d4b43]">Status</th>
                <th className="px-4 py-3 font-semibold text-[#1d4b43]">Emails</th>
                <th className="px-4 py-3 font-semibold text-[#1d4b43]">Source</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-[#e7e4dc] last:border-b-0 hover:bg-[#f7f7fb]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#1d4b43]">{lead.businessName}</div>
                    {lead.email && (
                      <div className="text-xs text-[#4b5563]">{lead.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#4b5563]">
                    {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">{scoreBadge(lead.leadScore)}</td>
                  <td className="px-4 py-3">{statusBadge(lead.status)}</td>
                  <td className="px-4 py-3 text-[#4b5563]">{lead._count.emails}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-[#f7f7fb] px-2 py-0.5 text-xs text-[#4b5563]">
                      {lead.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
