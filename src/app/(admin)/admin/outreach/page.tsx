"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

// ---------- Types ----------
type Lead = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  notes: string | null;
  leadScore: number | null;
  leadTemperature: string | null;
  leadType: string | null;
  createdAt: string;
};

type Stats = {
  total: number;
  thisMonth: number;
  byStatus: Record<string, number>;
  byTemperature: Record<string, number>;
};

type StoreResult = {
  osmId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string | null;
  website: string | null;
  email: string | null;
};

type IntentResult = {
  name: string;
  website: string | null;
  type: string;
  city?: string;
  state?: string;
};

type EmailVariant = {
  type: string;
  label: string;
  subject: string;
  body: string;
};

type Tab = "dashboard" | "search" | "pipeline" | "intent" | "export";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const LEAD_TYPES = [
  { value: "pet_store", label: "Pet Store" },
  { value: "groomer", label: "Groomer" },
  { value: "daycare", label: "Pet Daycare" },
  { value: "vet", label: "Veterinary Clinic" },
  { value: "trainer", label: "Dog Trainer" },
  { value: "boutique", label: "Pet Boutique" },
  { value: "grocery", label: "Grocery / Feed Store" },
  { value: "online_seller", label: "Online Seller" },
];

const TEMP_COLORS: Record<string, string> = {
  HOT: "bg-red-100 text-red-700",
  WARM: "bg-orange-100 text-orange-700",
  COLD: "bg-blue-100 text-blue-700",
};

// ---------- Page ----------
export default function AdminOutreachPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  // --- Stats state ---
  const [stats, setStats] = useState<Stats | null>(null);

  // --- Intent state ---
  const [intentQuery, setIntentQuery] = useState("");
  const [intentCity, setIntentCity] = useState("");
  const [intentState, setIntentState] = useState("");
  const [intentSearching, setIntentSearching] = useState(false);
  const [intentResults, setIntentResults] = useState<IntentResult[]>([]);
  const [intentError, setIntentError] = useState("");
  const [intentAdded, setIntentAdded] = useState<Set<string>>(new Set());

  // --- Export state ---
  const [exporting, setExporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);

  // --- Search state ---
  const [city, setCity] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<StoreResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [addedOsmIds, setAddedOsmIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  // --- Pipeline state ---
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [manualForm, setManualForm] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [addingManual, setAddingManual] = useState(false);

  // --- Email gen state ---
  const [emailLead, setEmailLead] = useState<Lead | null>(null);
  const [leadType, setLeadType] = useState("pet_store");
  const [sequenceStep, setSequenceStep] = useState(1);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [emailVariants, setEmailVariants] = useState<EmailVariant[]>([]);
  const [singleEmail, setSingleEmail] = useState<{ subject: string; body: string } | null>(null);
  const [activeVariant, setActiveVariant] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/leads/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // non-critical
    }
  }

  // ---------- API calls ----------
  async function fetchLeads() {
    setLoadingLeads(true);
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    setLeads(data.leads || []);
    setLoadingLeads(false);
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!city.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResults([]);
    try {
      const params = new URLSearchParams({ city: city.trim() });
      if (stateInput.trim()) params.set("state", stateInput.trim());
      const res = await fetch(`/api/admin/outreach/search?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSearchResults(data.stores || []);
      if ((data.stores || []).length === 0)
        setSearchError("No pet stores found. Try a different city or spelling.");
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function addStoreLead(store: StoreResult) {
    setAddingId(store.osmId);
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: store.name,
        contactName: "",
        email: store.email || "",
        phone: store.phone || "",
        source: "SEARCH",
        notes: [
          store.address && `Address: ${store.address}, ${store.city}, ${store.state} ${store.zip}`,
          store.website && `Website: ${store.website}`,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });
    if (res.ok) {
      setAddedOsmIds((prev) => new Set(prev).add(store.osmId));
      await fetchLeads();
    }
    setAddingId(null);
  }

  async function updateLeadStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchLeads();
  }

  async function addManualLead(e: FormEvent) {
    e.preventDefault();
    setAddingManual(true);
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...manualForm, source: "MANUAL" }),
    });
    if (res.ok) {
      setManualForm({ businessName: "", contactName: "", email: "", phone: "" });
      await fetchLeads();
      await fetchStats();
    }
    setAddingManual(false);
  }

  async function handleIntentSearch(e: FormEvent) {
    e.preventDefault();
    if (!intentQuery.trim()) return;
    setIntentSearching(true);
    setIntentError("");
    setIntentResults([]);
    try {
      const params = new URLSearchParams({ query: intentQuery.trim() });
      if (intentCity.trim()) params.set("city", intentCity.trim());
      if (intentState.trim()) params.set("state", intentState.trim());
      const res = await fetch(`/api/admin/outreach/intent?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setIntentResults(data.results || []);
      if ((data.results || []).length === 0) setIntentError("No results found for that query.");
    } catch (err: unknown) {
      setIntentError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setIntentSearching(false);
    }
  }

  async function addIntentLead(result: IntentResult) {
    const key = result.name + (result.website ?? "");
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: result.name,
        contactName: "",
        email: "",
        website: result.website || "",
        city: result.city || "",
        state: result.state || "",
        leadType: result.type,
        source: "INTENT",
      }),
    });
    if (res.ok) {
      setIntentAdded((prev) => new Set(prev).add(key));
      await fetchLeads();
      await fetchStats();
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/leads/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  }

  async function handleBulkImport(e: FormEvent) {
    e.preventDefault();
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    const text = await importFile.text();
    const res = await fetch("/api/admin/leads/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: text,
    });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);
    if (res.ok) {
      await fetchLeads();
      await fetchStats();
    }
  }

  async function generateEmail() {
    if (!emailLead) return;
    setGeneratingEmail(true);
    setEmailVariants([]);
    setSingleEmail(null);
    const res = await fetch("/api/admin/outreach/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: emailLead.businessName,
        leadType,
        sequenceStep,
      }),
    });
    const data = await res.json();
    if (sequenceStep === 1 && data.variants) {
      setEmailVariants(data.variants);
      setActiveVariant(0);
    } else {
      setSingleEmail({ subject: data.subject, body: data.body });
    }
    setGeneratingEmail(false);
  }

  function copyEmail(subject: string, body: string) {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ---------- Derived data ----------
  const filteredLeads =
    statusFilter === "ALL" ? leads : leads.filter((l) => l.status === statusFilter);

  const statusCounts = LEAD_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: leads.filter((l) => l.status === s).length }),
    {} as Record<string, number>
  );

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Outreach</h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Find pet stores, build your pipeline, and generate outreach emails.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e7e4dc]">
        <div className="flex gap-6 overflow-x-auto">
          {(
            [
              { id: "dashboard", label: "📊 Dashboard" },
              { id: "search", label: "🔍 Find Leads" },
              { id: "pipeline", label: `📋 Pipeline (${leads.length})` },
              { id: "intent", label: "🎯 Intent Leads" },
              { id: "export", label: "📥 Export" },
            ] as { id: Tab; label: string }[]
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`whitespace-nowrap -mb-px pb-3 text-sm font-medium transition-colors ${
                tab === id
                  ? "border-b-2 border-[#1d4b43] text-[#1d4b43]"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== DASHBOARD TAB ===================== */}
      {tab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#e7e4dc] bg-white p-4 text-center">
              <p className="text-3xl font-bold text-[#111827]">{stats?.total ?? "—"}</p>
              <p className="mt-1 text-xs text-[#6b7280] font-medium">Total Leads</p>
            </div>
            <div className="rounded-xl border border-[#e7e4dc] bg-white p-4 text-center">
              <p className="text-3xl font-bold text-[#111827]">{stats?.thisMonth ?? "—"}</p>
              <p className="mt-1 text-xs text-[#6b7280] font-medium">This Month</p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-700">{stats?.byTemperature?.HOT ?? 0}</p>
              <p className="mt-1 text-xs text-red-600 font-medium">🔥 Hot</p>
            </div>
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-center">
              <p className="text-3xl font-bold text-orange-700">{stats?.byTemperature?.WARM ?? 0}</p>
              <p className="mt-1 text-xs text-orange-600 font-medium">⚡ Warm</p>
            </div>
          </div>

          {/* Status breakdown */}
          {stats && (
            <div className="rounded-xl border border-[#e7e4dc] bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-[#111827]">Pipeline Status</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {LEAD_STATUSES.map((s) => (
                  <div key={s} className="rounded-lg border border-[#e7e4dc] p-3 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{stats.byStatus?.[s] ?? 0}</p>
                    <p className={`mt-1 text-xs font-medium rounded-full px-2 py-0.5 inline-block ${STATUS_COLORS[s]}`}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent leads */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white">
            <div className="flex items-center justify-between border-b border-[#e7e4dc] px-5 py-3">
              <p className="text-sm font-semibold text-[#111827]">Recent Leads</p>
              <button
                onClick={() => setTab("pipeline")}
                className="text-xs text-[#1d4b43] underline underline-offset-2"
              >
                View all
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9] text-xs font-medium text-[#6b7280]">
                  <tr>
                    <th className="px-4 py-3 text-left">Business</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e4dc]">
                  {leads.slice(0, 10).map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#fcfbf9]">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/outreach/${lead.id}`}
                          className="font-medium text-[#1d4b43] hover:underline"
                        >
                          {lead.businessName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#6b7280]">{lead.email || "—"}</td>
                      <td className="px-4 py-3">
                        {lead.leadTemperature ? (
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TEMP_COLORS[lead.leadTemperature] ?? "bg-gray-100 text-gray-600"}`}>
                            {lead.leadTemperature} {lead.leadScore != null ? `(${lead.leadScore})` : ""}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#9ca3af]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== SEARCH TAB ===================== */}
      {tab === "search" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold text-[#111827]">Search Pet Stores</h2>
            <p className="mb-4 text-xs text-[#6b7280]">
              Finds independent pet stores, groomers, and pet-friendly shops via OpenStreetMap.
              Excludes PetSmart, Petco, and Pet Supplies Plus.
            </p>
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City (e.g. Denver)"
                className="flex-1 min-w-[160px] rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                required
              />
              <input
                value={stateInput}
                onChange={(e) => setStateInput(e.target.value)}
                placeholder="State (e.g. Colorado)"
                className="w-40 rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
              <button
                type="submit"
                disabled={searching}
                className="rounded bg-[#1d4b43] px-5 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
              >
                {searching ? "Searching…" : "Search"}
              </button>
            </form>
          </div>

          {/* Search results */}
          {searchError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {searchError}
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="rounded-xl border border-[#e7e4dc] bg-white">
              <div className="border-b border-[#e7e4dc] px-5 py-3">
                <p className="text-sm font-medium text-[#111827]">
                  {searchResults.length} store{searchResults.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9] text-xs font-medium text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3 text-left">Store</th>
                      <th className="px-4 py-3 text-left">Address</th>
                      <th className="px-4 py-3 text-left">Phone</th>
                      <th className="px-4 py-3 text-left">Website</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e4dc]">
                    {searchResults.map((store) => {
                      const added = addedOsmIds.has(store.osmId);
                      const loading = addingId === store.osmId;
                      return (
                        <tr key={store.osmId} className="hover:bg-[#fcfbf9]">
                          <td className="px-4 py-3 font-medium text-[#111827]">{store.name}</td>
                          <td className="px-4 py-3 text-[#4b5563]">
                            {[store.address, store.city, store.state, store.zip]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3 text-[#4b5563]">{store.phone || "—"}</td>
                          <td className="px-4 py-3">
                            {store.website ? (
                              <a
                                href={store.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate text-[#1d4b43] underline underline-offset-2 hover:text-[#163836]"
                              >
                                {store.website.replace(/^https?:\/\//, "").split("/")[0]}
                              </a>
                            ) : (
                              <span className="text-[#9ca3af]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {added ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                ✓ Added
                              </span>
                            ) : (
                              <button
                                onClick={() => addStoreLead(store)}
                                disabled={loading}
                                className="rounded border border-[#1d4b43] px-3 py-1 text-xs font-medium text-[#1d4b43] hover:bg-[#1d4b43] hover:text-white disabled:opacity-50 transition-colors"
                              >
                                {loading ? "Adding…" : "+ Add to Pipeline"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== PIPELINE TAB ===================== */}
      {tab === "pipeline" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {LEAD_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  statusFilter === s
                    ? "border-[#1d4b43] bg-[#1d4b43] text-white"
                    : "border-[#e7e4dc] bg-white hover:border-[#1d4b43]/40"
                }`}
              >
                <p className="text-xl font-bold">{statusCounts[s] || 0}</p>
                <p className="text-xs font-medium opacity-80">{s}</p>
              </button>
            ))}
          </div>

          {/* Add manual lead */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-[#111827]">Add Lead Manually</h2>
            <form onSubmit={addManualLead} className="flex flex-wrap gap-3">
              <input
                value={manualForm.businessName}
                onChange={(e) => setManualForm((f) => ({ ...f, businessName: e.target.value }))}
                placeholder="Business name *"
                className="flex-1 min-w-[160px] rounded border border-[#e7e4dc] px-3 py-2 text-sm"
                required
              />
              <input
                value={manualForm.contactName}
                onChange={(e) => setManualForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Contact name"
                className="flex-1 min-w-[140px] rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
              <input
                type="email"
                value={manualForm.email}
                onChange={(e) => setManualForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className="flex-1 min-w-[160px] rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
              <input
                value={manualForm.phone}
                onChange={(e) => setManualForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Phone"
                className="w-36 rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={addingManual}
                className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
              >
                {addingManual ? "Adding…" : "Add"}
              </button>
            </form>
          </div>

          {/* Lead table */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white">
            <div className="border-b border-[#e7e4dc] px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[#111827]">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? "s" : ""}
                  {statusFilter !== "ALL" && ` · ${statusFilter}`}
                </span>
                {statusFilter !== "ALL" && (
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="text-xs text-[#6b7280] underline underline-offset-2"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>

            {loadingLeads ? (
              <p className="px-5 py-6 text-sm text-[#6b7280]">Loading leads…</p>
            ) : filteredLeads.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6b7280]">No leads found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9] text-xs font-medium text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3 text-left">Business</th>
                      <th className="px-4 py-3 text-left">Contact / Email</th>
                      <th className="px-4 py-3 text-left">Source</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Added</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e4dc]">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-[#fcfbf9]">
                        <td className="px-4 py-3">
                          <Link href={`/admin/outreach/${lead.id}`} className="font-medium text-[#1d4b43] hover:underline">
                            {lead.businessName}
                          </Link>
                          {lead.phone && (
                            <p className="text-xs text-[#9ca3af]">{lead.phone}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#4b5563]">
                          <p>{lead.contactName || "—"}</p>
                          {lead.email && (
                            <p className="text-xs text-[#9ca3af]">{lead.email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {lead.leadTemperature ? (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TEMP_COLORS[lead.leadTemperature] ?? "bg-gray-100 text-gray-600"}`}>
                              {lead.leadTemperature} {lead.leadScore != null ? `(${lead.leadScore})` : ""}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                              STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {LEAD_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#9ca3af]">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/outreach/${lead.id}`}
                            className="rounded border border-[#e7e4dc] px-3 py-1 text-xs hover:border-[#1d4b43] hover:text-[#1d4b43] transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== EMAIL PANEL ===================== */}
      {emailLead && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 sm:items-start sm:pt-12 sm:pr-6">
          <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-[#e7e4dc] bg-white shadow-2xl flex flex-col max-h-[90vh]">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-[#e7e4dc] px-5 py-4">
              <div>
                <p className="text-xs font-medium text-[#6b7280]">Drafting email for</p>
                <p className="font-semibold text-[#111827]">{emailLead.businessName}</p>
              </div>
              <button
                onClick={() => setEmailLead(null)}
                className="text-[#9ca3af] hover:text-[#111827] text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[160px]">
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">
                    Lead Type
                  </label>
                  <select
                    value={leadType}
                    onChange={(e) => setLeadType(e.target.value)}
                    className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                  >
                    {LEAD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-36">
                  <label className="mb-1 block text-xs font-medium text-[#6b7280]">
                    Sequence Step
                  </label>
                  <select
                    value={sequenceStep}
                    onChange={(e) => setSequenceStep(Number(e.target.value))}
                    className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                  >
                    <option value={1}>Step 1 — Cold</option>
                    <option value={2}>Step 2 — Follow-up</option>
                    <option value={3}>Step 3 — New angle</option>
                    <option value={4}>Step 4 — Sample offer</option>
                    <option value={5}>Step 5 — Final</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateEmail}
                disabled={generatingEmail}
                className="w-full rounded bg-[#1d4b43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60 transition-colors"
              >
                {generatingEmail ? "Generating…" : "✨ Generate Email"}
              </button>

              {/* Variants (step 1) */}
              {emailVariants.length > 0 && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {emailVariants.map((v, i) => (
                      <button
                        key={v.type}
                        onClick={() => setActiveVariant(i)}
                        className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          activeVariant === i
                            ? "border-[#1d4b43] bg-[#1d4b43] text-white"
                            : "border-[#e7e4dc] text-[#4b5563] hover:border-[#1d4b43]/40"
                        }`}
                      >
                        {v.type} — {v.label}
                      </button>
                    ))}
                  </div>
                  {emailVariants[activeVariant] && (
                    <EmailDisplay
                      subject={emailVariants[activeVariant].subject}
                      body={emailVariants[activeVariant].body}
                      copied={copied}
                      onCopy={() =>
                        copyEmail(
                          emailVariants[activeVariant].subject,
                          emailVariants[activeVariant].body
                        )
                      }
                    />
                  )}
                </div>
              )}

              {/* Single email (steps 2–5) */}
              {singleEmail && (
                <EmailDisplay
                  subject={singleEmail.subject}
                  body={singleEmail.body}
                  copied={copied}
                  onCopy={() => copyEmail(singleEmail.subject, singleEmail.body)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== INTENT LEADS TAB ===================== */}
      {tab === "intent" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold text-[#111827]">Intent-Based Lead Search</h2>
            <p className="mb-4 text-xs text-[#6b7280]">
              Find businesses that distribute, resell, or carry pet products — not just pet stores.
            </p>
            <form onSubmit={handleIntentSearch} className="flex flex-wrap gap-3">
              <input
                value={intentQuery}
                onChange={(e) => setIntentQuery(e.target.value)}
                placeholder='e.g. "dog treat distributor" or "pet food reseller"'
                className="flex-1 min-w-[200px] rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                required
              />
              <input
                value={intentCity}
                onChange={(e) => setIntentCity(e.target.value)}
                placeholder="City (optional)"
                className="w-36 rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
              <input
                value={intentState}
                onChange={(e) => setIntentState(e.target.value)}
                placeholder="State (optional)"
                className="w-36 rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
              <button
                type="submit"
                disabled={intentSearching}
                className="rounded bg-[#1d4b43] px-5 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
              >
                {intentSearching ? "Searching…" : "Search"}
              </button>
            </form>
          </div>

          {intentError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {intentError}
            </p>
          )}

          {intentResults.length > 0 && (
            <div className="rounded-xl border border-[#e7e4dc] bg-white">
              <div className="border-b border-[#e7e4dc] px-5 py-3">
                <p className="text-sm font-medium text-[#111827]">
                  {intentResults.length} result{intentResults.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9] text-xs font-medium text-[#6b7280]">
                    <tr>
                      <th className="px-4 py-3 text-left">Business</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Website</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e4dc]">
                    {intentResults.map((r) => {
                      const key = r.name + (r.website ?? "");
                      const added = intentAdded.has(key);
                      return (
                        <tr key={key} className="hover:bg-[#fcfbf9]">
                          <td className="px-4 py-3 font-medium text-[#111827]">{r.name}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
                              {r.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#6b7280]">
                            {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {r.website ? (
                              <a
                                href={r.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#1d4b43] underline underline-offset-2 hover:text-[#163836]"
                              >
                                {r.website.replace(/^https?:\/\//, "").split("/")[0]}
                              </a>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {added ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                ✓ Added
                              </span>
                            ) : (
                              <button
                                onClick={() => addIntentLead(r)}
                                className="rounded border border-[#1d4b43] px-3 py-1 text-xs font-medium text-[#1d4b43] hover:bg-[#1d4b43] hover:text-white transition-colors"
                              >
                                + Add to Pipeline
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== EXPORT TAB ===================== */}
      {tab === "export" && (
        <div className="space-y-6">
          {/* CSV Export */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold text-[#111827]">Export Leads</h2>
            <p className="mb-4 text-sm text-[#6b7280]">
              Download all leads as a CSV file. Includes business name, contact, email, phone,
              website, city, state, lead type, score, temperature, and status.
            </p>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="rounded bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
            >
              {exporting ? "Preparing download…" : "⬇ Download CSV"}
            </button>
          </div>

          {/* Bulk Import */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5">
            <h2 className="mb-1 text-base font-semibold text-[#111827]">Bulk Import</h2>
            <p className="mb-4 text-sm text-[#6b7280]">
              Upload a CSV file to import leads in bulk. Required columns:{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">businessName</code>,{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">email</code>. Optional:{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">contactName</code>,{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">phone</code>,{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">website</code>,{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">city</code>,{" "}
              <code className="rounded bg-[#f3f4f6] px-1 py-0.5 text-xs">state</code>.
            </p>
            <form onSubmit={handleBulkImport} className="space-y-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] ?? null);
                  setImportResult(null);
                }}
                className="block text-sm text-[#6b7280] file:mr-3 file:rounded file:border-0 file:bg-[#1d4b43] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#163836]"
              />
              <button
                type="submit"
                disabled={!importFile || importing}
                className="rounded bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
              >
                {importing ? "Importing…" : "Import"}
              </button>
            </form>
            {importResult && (
              <div className="mt-4 rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 space-y-2">
                <p className="text-sm font-medium text-[#111827]">
                  ✓ {importResult.created} lead{importResult.created !== 1 ? "s" : ""} imported
                </p>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#6b7280]">
                      {importResult.errors.length} row{importResult.errors.length !== 1 ? "s" : ""} skipped:
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {importResult.errors.slice(0, 10).map((err, i) => (
                        <li key={i} className="text-xs text-red-600">{err}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li className="text-xs text-[#9ca3af]">…and {importResult.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- EmailDisplay sub-component ----------
function EmailDisplay({
  subject,
  body,
  copied,
  onCopy,
}: {
  subject: string;
  body: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-4 space-y-3">
      <div>
        <p className="mb-1 text-xs font-medium text-[#6b7280]">Subject</p>
        <p className="font-medium text-[#111827]">{subject}</p>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-[#6b7280]">Body</p>
        <pre className="whitespace-pre-wrap font-sans text-sm text-[#374151] leading-relaxed">
          {body}
        </pre>
      </div>
      <button
        onClick={onCopy}
        className="w-full rounded border border-[#e7e4dc] px-4 py-2 text-xs font-medium text-[#4b5563] hover:border-[#1d4b43] hover:text-[#1d4b43] transition-colors"
      >
        {copied ? "✓ Copied!" : "Copy email"}
      </button>
    </div>
  );
}

