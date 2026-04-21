"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ---------- Types ----------
type Lead = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  source: string;
  status: string;
  notes: string | null;
  leadScore: number | null;
  leadTemperature: string | null;
  leadType: string | null;
  sellsDogTreats: boolean;
  sellsCompetitorProducts: boolean;
  instagram: string | null;
  contactedAt: string | null;
  createdAt: string;
};

type OutreachEmail = {
  id: string;
  subject: string;
  body: string;
  status: string;
  sequenceStep: number;
  sentAt: string | null;
  createdAt: string;
};

type LeadActivity = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  createdAt: string;
};

type LeadDeal = {
  id: string;
  value: number;
  status: string;
  lossReason: string | null;
  closedAt: string | null;
  createdAt: string;
};

type LeadSample = {
  id: string;
  status: string;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  feedback: string | null;
  createdAt: string;
};

type Sequence = {
  id: string;
  currentStep: number;
  status: string;
  nextSendAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

type EmailVariant = {
  type: string;
  label: string;
  subject: string;
  body: string;
};

type Tab = "details" | "emails" | "history" | "deals" | "samples";

// ---------- Constants ----------
const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"];

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  QUALIFIED: "bg-purple-100 text-purple-700",
  CONVERTED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const TEMP_COLORS: Record<string, string> = {
  HOT: "bg-red-100 text-red-700",
  WARM: "bg-orange-100 text-orange-700",
  COLD: "bg-blue-100 text-blue-700",
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

// ---------- Page ----------
export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("details");

  // --- Lead state ---
  const [lead, setLead] = useState<Lead | null>(null);
  const [loadingLead, setLoadingLead] = useState(true);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // --- Emails state ---
  const [emails, setEmails] = useState<OutreachEmail[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [genLeadType, setGenLeadType] = useState("pet_store");
  const [genStep, setGenStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<EmailVariant[]>([]);
  const [activeVariant, setActiveVariant] = useState(0);
  const [singleEmail, setSingleEmail] = useState<{ subject: string; body: string } | null>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // --- Activities state ---
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityForm, setActivityForm] = useState({ type: "NOTE", title: "", detail: "" });
  const [addingActivity, setAddingActivity] = useState(false);

  // --- Deals state ---
  const [deals, setDeals] = useState<LeadDeal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [dealForm, setDealForm] = useState({ value: "", status: "OPEN" });
  const [addingDeal, setAddingDeal] = useState(false);

  // --- Samples & Sequences state ---
  const [samples, setSamples] = useState<LeadSample[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [startingSeq, setStartingSeq] = useState(false);
  const [cancellingSeq, setCancellingSeq] = useState(false);

  // ---------- Fetch lead ----------
  const fetchLead = useCallback(async () => {
    setLoadingLead(true);
    const res = await fetch(`/api/admin/leads/${id}`);
    const data = await res.json();
    if (data.lead) {
      setLead(data.lead);
      setEditForm(data.lead);
      setSequences(data.lead.sequences ?? []);
    }
    setLoadingLead(false);
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // Lazy-load per tab
  useEffect(() => {
    if (tab === "emails") fetchEmails();
    if (tab === "history") fetchActivities();
    if (tab === "deals") fetchDeals();
    if (tab === "samples") fetchSamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function fetchEmails() {
    setLoadingEmails(true);
    const res = await fetch(`/api/admin/leads/${id}/emails`);
    const data = await res.json();
    setEmails(data.emails ?? []);
    setLoadingEmails(false);
  }

  async function fetchActivities() {
    setLoadingActivities(true);
    const res = await fetch(`/api/admin/leads/${id}/activities`);
    const data = await res.json();
    setActivities(data.activities ?? []);
    setLoadingActivities(false);
  }

  async function fetchDeals() {
    setLoadingDeals(true);
    const res = await fetch(`/api/admin/leads/${id}/deals`);
    const data = await res.json();
    setDeals(data.deals ?? []);
    setLoadingDeals(false);
  }

  async function fetchSamples() {
    setLoadingSamples(true);
    const res = await fetch(`/api/admin/leads/${id}/samples`);
    const data = await res.json();
    setSamples(data.samples ?? []);
    setLoadingSamples(false);
  }

  // ---------- Details ----------
  async function saveLead(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 2500);
    } else {
      setSaveMsg("Save failed.");
    }
    setSaving(false);
  }

  // ---------- Email Studio ----------
  async function generateEmail() {
    if (!lead) return;
    setGenerating(true);
    setVariants([]);
    setSingleEmail(null);
    const res = await fetch("/api/admin/outreach/generate-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeName: lead.businessName, leadType: genLeadType, sequenceStep: genStep }),
    });
    const data = await res.json();
    if (genStep === 1 && data.variants) {
      setVariants(data.variants);
      setActiveVariant(0);
    } else {
      setSingleEmail({ subject: data.subject, body: data.body });
    }
    setGenerating(false);
  }

  async function saveEmailDraft(subject: string, body: string) {
    setSavingEmail(true);
    const res = await fetch(`/api/admin/leads/${id}/emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, sequenceStep: genStep }),
    });
    if (res.ok) {
      await fetchEmails();
      setSaveMsg("Email saved as draft.");
      setTimeout(() => setSaveMsg(""), 2500);
    }
    setSavingEmail(false);
  }

  async function sendEmail(emailId: string) {
    setSendingId(emailId);
    const res = await fetch(`/api/admin/leads/${id}/emails/${emailId}/send`, {
      method: "POST",
    });
    if (res.ok) {
      await fetchEmails();
    }
    setSendingId(null);
  }

  function copyEmail(subject: string, body: string) {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ---------- Activities ----------
  async function addActivity(e: FormEvent) {
    e.preventDefault();
    if (!activityForm.title.trim()) return;
    setAddingActivity(true);
    const res = await fetch(`/api/admin/leads/${id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activityForm),
    });
    if (res.ok) {
      setActivityForm({ type: "NOTE", title: "", detail: "" });
      await fetchActivities();
    }
    setAddingActivity(false);
  }

  // ---------- Deals ----------
  async function addDeal(e: FormEvent) {
    e.preventDefault();
    setAddingDeal(true);
    const res = await fetch(`/api/admin/leads/${id}/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: parseFloat(dealForm.value) || 0, status: dealForm.status }),
    });
    if (res.ok) {
      setDealForm({ value: "", status: "OPEN" });
      await fetchDeals();
    }
    setAddingDeal(false);
  }

  async function updateDealStatus(dealId: string, status: string) {
    const res = await fetch(`/api/admin/leads/${id}/deals`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId, status }),
    });
    if (res.ok) await fetchDeals();
  }

  // ---------- Samples ----------
  async function requestSample() {
    const res = await fetch(`/api/admin/leads/${id}/samples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REQUESTED" }),
    });
    if (res.ok) await fetchSamples();
  }

  async function updateSampleStatus(sampleId: string, status: string) {
    const res = await fetch(`/api/admin/leads/${id}/samples`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId, status }),
    });
    if (res.ok) await fetchSamples();
  }

  // ---------- Sequences ----------
  async function startSequence() {
    setStartingSeq(true);
    const res = await fetch(`/api/admin/leads/${id}/sequences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) await fetchLead();
    setStartingSeq(false);
  }

  async function cancelSequence(seqId: string) {
    setCancellingSeq(true);
    const res = await fetch(`/api/admin/leads/${id}/sequences`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sequenceId: seqId }),
    });
    if (res.ok) await fetchLead();
    setCancellingSeq(false);
  }

  // ---------- Loading ----------
  if (loadingLead) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#6b7280]">Loading lead…</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link href="/admin/outreach" className="text-sm text-[#1d4b43] hover:underline">
          ← Back to Outreach
        </Link>
        <p className="text-sm text-red-600">Lead not found.</p>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link href="/admin/outreach" className="text-xs text-[#6b7280] hover:text-[#1d4b43]">
          ← Outreach
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">{lead.businessName}</h1>
            {lead.contactName && (
              <p className="mt-0.5 text-sm text-[#6b7280]">{lead.contactName}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {lead.leadTemperature && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TEMP_COLORS[lead.leadTemperature] ?? "bg-gray-100 text-gray-600"}`}>
                {lead.leadTemperature}
                {lead.leadScore != null && ` · ${lead.leadScore}`}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
              {lead.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e7e4dc]">
        <div className="flex gap-6 overflow-x-auto">
          {(
            [
              { id: "details", label: "📝 Details" },
              { id: "emails", label: `✉ Email Studio (${emails.length || ""})` },
              { id: "history", label: "📅 Activity" },
              { id: "deals", label: `💰 Deals (${deals.length || ""})` },
              { id: "samples", label: `📦 Samples & Sequences` },
            ] as { id: Tab; label: string }[]
          ).map(({ id: tabId, label }) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`whitespace-nowrap -mb-px pb-3 text-sm font-medium transition-colors ${
                tab === tabId
                  ? "border-b-2 border-[#1d4b43] text-[#1d4b43]"
                  : "text-[#6b7280] hover:text-[#111827]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== DETAILS TAB ===================== */}
      {tab === "details" && (
        <form onSubmit={saveLead} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Name">
              <input
                value={editForm.businessName ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, businessName: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                required
              />
            </Field>
            <Field label="Contact Name">
              <input
                value={editForm.contactName ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, contactName: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
            </Field>
            <Field label="Phone">
              <input
                value={editForm.phone ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
            </Field>
            <Field label="Website">
              <input
                value={editForm.website ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, website: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                placeholder="https://..."
              />
            </Field>
            <Field label="Instagram">
              <input
                value={editForm.instagram ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, instagram: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                placeholder="@handle"
              />
            </Field>
            <Field label="Status">
              <select
                value={editForm.status ?? "NEW"}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Lead Type">
              <select
                value={editForm.leadType ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, leadType: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              >
                <option value="">— select —</option>
                {LEAD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="City">
              <input
                value={editForm.city ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
            </Field>
            <Field label="State">
              <input
                value={editForm.state ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
            </Field>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.sellsDogTreats ?? false}
                onChange={(e) => setEditForm((f) => ({ ...f, sellsDogTreats: e.target.checked }))}
                className="rounded border-[#e7e4dc] accent-[#1d4b43]"
              />
              Sells Dog Treats
            </label>
            <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.sellsCompetitorProducts ?? false}
                onChange={(e) => setEditForm((f) => ({ ...f, sellsCompetitorProducts: e.target.checked }))}
                className="rounded border-[#e7e4dc] accent-[#1d4b43]"
              />
              Sells Competitor Products
            </label>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={editForm.notes ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              rows={4}
              className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
            />
          </Field>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-[#1d4b43] px-5 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saveMsg && (
              <p className={`text-sm ${saveMsg.includes("failed") ? "text-red-600" : "text-green-600"}`}>
                {saveMsg}
              </p>
            )}
          </div>
        </form>
      )}

      {/* ===================== EMAIL STUDIO TAB ===================== */}
      {tab === "emails" && (
        <div className="space-y-6">
          {/* Generator */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#111827]">Generate Email</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[160px]">
                <label className="mb-1 block text-xs font-medium text-[#6b7280]">Lead Type</label>
                <select
                  value={genLeadType}
                  onChange={(e) => setGenLeadType(e.target.value)}
                  className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                >
                  {LEAD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="w-44">
                <label className="mb-1 block text-xs font-medium text-[#6b7280]">Step</label>
                <select
                  value={genStep}
                  onChange={(e) => setGenStep(Number(e.target.value))}
                  className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                >
                  <option value={1}>Step 1 — Cold outreach</option>
                  <option value={2}>Step 2 — Follow-up</option>
                  <option value={3}>Step 3 — New angle</option>
                  <option value={4}>Step 4 — Sample offer</option>
                  <option value={5}>Step 5 — Final</option>
                </select>
              </div>
            </div>
            <button
              onClick={generateEmail}
              disabled={generating}
              className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60 transition-colors"
            >
              {generating ? "Generating…" : "✨ Generate Email"}
            </button>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {variants.map((v, i) => (
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
                {variants[activeVariant] && (
                  <EmailCard
                    subject={variants[activeVariant].subject}
                    body={variants[activeVariant].body}
                    copied={copied}
                    onCopy={() => copyEmail(variants[activeVariant].subject, variants[activeVariant].body)}
                    onSave={() => saveEmailDraft(variants[activeVariant].subject, variants[activeVariant].body)}
                    saving={savingEmail}
                  />
                )}
              </div>
            )}

            {/* Single */}
            {singleEmail && (
              <EmailCard
                subject={singleEmail.subject}
                body={singleEmail.body}
                copied={copied}
                onCopy={() => copyEmail(singleEmail.subject, singleEmail.body)}
                onSave={() => saveEmailDraft(singleEmail.subject, singleEmail.body)}
                saving={savingEmail}
              />
            )}
          </div>

          {/* Saved emails list */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white">
            <div className="border-b border-[#e7e4dc] px-5 py-3">
              <p className="text-sm font-semibold text-[#111827]">Saved Emails</p>
            </div>
            {loadingEmails ? (
              <p className="px-5 py-6 text-sm text-[#6b7280]">Loading…</p>
            ) : emails.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6b7280]">No emails yet.</p>
            ) : (
              <div className="divide-y divide-[#e7e4dc]">
                {emails.map((em) => (
                  <div key={em.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#111827] truncate">{em.subject}</p>
                      <p className="mt-0.5 text-xs text-[#9ca3af]">
                        Step {em.sequenceStep} · {em.status}
                        {em.sentAt && ` · Sent ${new Date(em.sentAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    {em.status === "DRAFT" && (
                      <button
                        onClick={() => sendEmail(em.id)}
                        disabled={sendingId === em.id}
                        className="shrink-0 rounded bg-[#1d4b43] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
                      >
                        {sendingId === em.id ? "Sending…" : "Send"}
                      </button>
                    )}
                    {em.status === "SENT" && (
                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        ✓ Sent
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== ACTIVITY TAB ===================== */}
      {tab === "history" && (
        <div className="space-y-6">
          {/* Add activity form */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#111827]">Log Activity</h2>
            <form onSubmit={addActivity} className="space-y-3">
              <div className="flex flex-wrap gap-3">
                <select
                  value={activityForm.type}
                  onChange={(e) => setActivityForm((f) => ({ ...f, type: e.target.value }))}
                  className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                >
                  {["NOTE", "CALL", "EMAIL", "MEETING", "DEMO", "OTHER"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={activityForm.title}
                  onChange={(e) => setActivityForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Title *"
                  className="flex-1 min-w-[180px] rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
                  required
                />
              </div>
              <textarea
                value={activityForm.detail}
                onChange={(e) => setActivityForm((f) => ({ ...f, detail: e.target.value }))}
                placeholder="Details (optional)"
                rows={2}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
              <button
                type="submit"
                disabled={addingActivity}
                className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
              >
                {addingActivity ? "Logging…" : "Log Activity"}
              </button>
            </form>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white">
            <div className="border-b border-[#e7e4dc] px-5 py-3">
              <p className="text-sm font-semibold text-[#111827]">History</p>
            </div>
            {loadingActivities ? (
              <p className="px-5 py-6 text-sm text-[#6b7280]">Loading…</p>
            ) : activities.length === 0 ? (
              <p className="px-5 py-6 text-sm text-[#6b7280]">No activity yet.</p>
            ) : (
              <div className="divide-y divide-[#e7e4dc]">
                {activities.map((a) => (
                  <div key={a.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 rounded-full bg-[#f3f4f6] px-2 py-0.5 text-xs font-medium text-[#6b7280]">
                        {a.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#111827]">{a.title}</p>
                        {a.detail && (
                          <p className="mt-0.5 text-sm text-[#6b7280]">{a.detail}</p>
                        )}
                        <p className="mt-1 text-xs text-[#9ca3af]">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== DEALS TAB ===================== */}
      {tab === "deals" && (
        <div className="space-y-6">
          {/* Add deal */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 space-y-3">
            <h2 className="text-sm font-semibold text-[#111827]">Create Deal</h2>
            <form onSubmit={addDeal} className="flex flex-wrap gap-3">
              <input
                type="number"
                value={dealForm.value}
                onChange={(e) => setDealForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Value ($)"
                min="0"
                step="0.01"
                className="w-36 rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              />
              <select
                value={dealForm.status}
                onChange={(e) => setDealForm((f) => ({ ...f, status: e.target.value }))}
                className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d4b43]/30"
              >
                {["OPEN", "WON", "LOST"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={addingDeal}
                className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
              >
                {addingDeal ? "Creating…" : "Create Deal"}
              </button>
            </form>
          </div>

          {/* Deals list */}
          {loadingDeals ? (
            <p className="text-sm text-[#6b7280]">Loading…</p>
          ) : deals.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No deals yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {deals.map((deal) => (
                <div key={deal.id} className="rounded-xl border border-[#e7e4dc] bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-lg font-bold text-[#111827]">
                      ${Number(deal.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <select
                      value={deal.status}
                      onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer focus:outline-none ${
                        deal.status === "WON"
                          ? "bg-green-100 text-green-700"
                          : deal.status === "LOST"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {["OPEN", "WON", "LOST"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {deal.lossReason && (
                    <p className="text-xs text-[#9ca3af]">Loss reason: {deal.lossReason}</p>
                  )}
                  <p className="text-xs text-[#9ca3af]">
                    Created {new Date(deal.createdAt).toLocaleDateString()}
                    {deal.closedAt && ` · Closed ${new Date(deal.closedAt).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== SAMPLES & SEQUENCES TAB ===================== */}
      {tab === "samples" && (
        <div className="space-y-6">
          {/* Samples */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111827]">Samples</h2>
              <button
                onClick={requestSample}
                className="rounded border border-[#1d4b43] px-3 py-1.5 text-xs font-medium text-[#1d4b43] hover:bg-[#1d4b43] hover:text-white transition-colors"
              >
                + Request Sample
              </button>
            </div>
            {loadingSamples ? (
              <p className="text-sm text-[#6b7280]">Loading…</p>
            ) : samples.length === 0 ? (
              <p className="text-sm text-[#6b7280]">No samples requested yet.</p>
            ) : (
              <div className="space-y-3">
                {samples.map((s) => (
                  <div key={s.id} className="rounded-lg border border-[#e7e4dc] p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={s.status}
                        onChange={(e) => updateSampleStatus(s.id, e.target.value)}
                        className="rounded border border-[#e7e4dc] px-2 py-1 text-xs focus:outline-none"
                      >
                        {["REQUESTED", "SHIPPED", "DELIVERED", "DECLINED"].map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      <p className="text-xs text-[#9ca3af]">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {s.trackingNumber && (
                      <p className="text-xs text-[#6b7280]">Tracking: {s.trackingNumber}</p>
                    )}
                    {s.feedback && (
                      <p className="text-xs text-[#6b7280]">Feedback: {s.feedback}</p>
                    )}
                    {s.shippedAt && (
                      <p className="text-xs text-[#9ca3af]">
                        Shipped {new Date(s.shippedAt).toLocaleDateString()}
                        {s.deliveredAt && ` · Delivered ${new Date(s.deliveredAt).toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sequences */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#111827]">Follow-up Sequence</h2>
                <p className="mt-0.5 text-xs text-[#6b7280]">5-step automated email sequence (Days 0, 3, 4, 3, 7)</p>
              </div>
            </div>
            {sequences.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-[#6b7280]">No sequence active.</p>
                <button
                  onClick={startSequence}
                  disabled={startingSeq}
                  className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
                >
                  {startingSeq ? "Starting…" : "▶ Start Sequence"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sequences.map((seq) => (
                  <div key={seq.id} className="rounded-lg border border-[#e7e4dc] p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          seq.status === "ACTIVE" ? "bg-green-100 text-green-700"
                          : seq.status === "COMPLETED" ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                        }`}>
                          {seq.status}
                        </span>
                        <span className="ml-2 text-sm text-[#111827] font-medium">
                          Step {seq.currentStep} / 5
                        </span>
                      </div>
                      {seq.status === "ACTIVE" && (
                        <button
                          onClick={() => cancelSequence(seq.id)}
                          disabled={cancellingSeq}
                          className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          {cancellingSeq ? "Cancelling…" : "✕ Cancel"}
                        </button>
                      )}
                    </div>
                    {seq.nextSendAt && seq.status === "ACTIVE" && (
                      <p className="text-xs text-[#6b7280]">
                        Next send: {new Date(seq.nextSendAt).toLocaleString()}
                      </p>
                    )}
                    {seq.completedAt && (
                      <p className="text-xs text-[#9ca3af]">
                        Completed {new Date(seq.completedAt).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-[#9ca3af]">
                      Started {new Date(seq.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {sequences.every((s) => s.status !== "ACTIVE") && (
                  <button
                    onClick={startSequence}
                    disabled={startingSeq}
                    className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
                  >
                    {startingSeq ? "Starting…" : "▶ Start New Sequence"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Helper components ----------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#6b7280]">{label}</label>
      {children}
    </div>
  );
}

function EmailCard({
  subject,
  body,
  copied,
  onCopy,
  onSave,
  saving,
}: {
  subject: string;
  body: string;
  copied: boolean;
  onCopy: () => void;
  onSave: () => void;
  saving: boolean;
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
      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 rounded border border-[#e7e4dc] px-4 py-2 text-xs font-medium text-[#4b5563] hover:border-[#1d4b43] hover:text-[#1d4b43] transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded bg-[#1d4b43] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163836] disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : "Save as Draft"}
        </button>
      </div>
    </div>
  );
}
