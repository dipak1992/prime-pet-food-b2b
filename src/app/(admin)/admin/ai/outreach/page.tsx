"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Draft {
  id: string;
  subject: string;
  body: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
  lead: {
    id: string;
    businessName: string;
    contactName: string | null;
    email: string | null;
    city: string | null;
    state: string | null;
  };
}

type StatusTab = "DRAFT" | "SENT" | "FAILED";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OutreachPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("DRAFT");
  const [selected, setSelected] = useState<Draft | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [acting, setActing] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ---- Fetch drafts ---- */
  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai/outreach?status=${activeTab}`);
      if (!res.ok) throw new Error("Failed to load outreach drafts");
      const json = await res.json();
      setDrafts(json.drafts ?? []);
    } catch {
      setMessage({ type: "error", text: "Failed to load outreach drafts." });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDrafts();
    setSelected(null);
  }, [fetchDrafts]);

  /* ---- Select a draft ---- */
  function selectDraft(draft: Draft) {
    setSelected(draft);
    setEditSubject(draft.subject);
    setEditBody(draft.body);
    setMessage(null);
  }

  /* ---- Run agent ---- */
  async function handleGenerate() {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "outreach_drafter" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setMessage({ type: "success", text: "Outreach drafts generated successfully." });
      await fetchDrafts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Run failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setRunning(false);
    }
  }

  /* ---- Approve / Reject ---- */
  async function handleAction(action: "approve" | "reject") {
    if (!selected) return;
    setActing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/outreach", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: selected.id,
          action,
          editedSubject: editSubject,
          editedBody: editBody,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      setMessage({
        type: "success",
        text: action === "approve" ? "Email approved & sent." : "Email rejected.",
      });
      setSelected(null);
      await fetchDrafts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setActing(false);
    }
  }

  /* ---- Tab styles ---- */
  const tabs: StatusTab[] = ["DRAFT", "SENT", "FAILED"];

  function tabClass(tab: StatusTab) {
    return tab === activeTab
      ? "rounded-t border border-b-0 border-[#e7e4dc] bg-white px-4 py-2 text-sm font-semibold text-[#1d4b43]"
      : "rounded-t border border-transparent px-4 py-2 text-sm font-medium text-[#4b5563] hover:text-[#1d4b43]";
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
            <h1 className="text-2xl font-bold text-[#1d4b43]">Outreach Draft Queue</h1>
          </div>
          <p className="mt-1 text-sm text-[#4b5563]">
            Review, edit, and approve AI-generated outreach emails before sending.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={running}
          className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
        >
          {running ? "Generating…" : "Generate Drafts"}
        </button>
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

      {/* ---- Tabs ---- */}
      <div className="flex gap-1 border-b border-[#e7e4dc]">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={tabClass(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {/* ---- Content: two-column layout ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d4b43] border-t-transparent" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#4b5563]">
          No {activeTab.toLowerCase()} emails found.
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* ---- Left: draft list ---- */}
          <div className="space-y-3 lg:col-span-2">
            {drafts.map((draft) => (
              <button
                key={draft.id}
                onClick={() => selectDraft(draft)}
                className={`w-full rounded-xl border p-4 text-left shadow-sm transition ${
                  selected?.id === draft.id
                    ? "border-[#1d4b43] bg-[#f7f7fb]"
                    : "border-[#e7e4dc] bg-white hover:border-[#1d4b43]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#1d4b43]">
                    {draft.lead.businessName}
                  </span>
                  <span className="text-xs text-[#4b5563]">
                    {new Date(draft.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {draft.lead.email && (
                  <div className="mt-0.5 text-xs text-[#4b5563]">{draft.lead.email}</div>
                )}
                <div className="mt-2 text-sm font-medium text-[#1d4b43]">{draft.subject}</div>
                <p className="mt-1 line-clamp-2 text-xs text-[#4b5563]">{draft.body}</p>
              </button>
            ))}
          </div>

          {/* ---- Right: editor panel ---- */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm">
                <h3 className="mb-1 text-sm font-semibold text-[#1d4b43]">
                  To: {selected.lead.businessName}
                  {selected.lead.email && (
                    <span className="ml-2 font-normal text-[#4b5563]">
                      ({selected.lead.email})
                    </span>
                  )}
                </h3>

                <label className="mt-4 block text-xs font-medium text-[#4b5563]">Subject</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  disabled={activeTab !== "DRAFT"}
                  className="mt-1 w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm text-[#1d4b43] focus:border-[#1d4b43] focus:outline-none disabled:bg-[#f7f7fb]"
                />

                <label className="mt-4 block text-xs font-medium text-[#4b5563]">Body</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  disabled={activeTab !== "DRAFT"}
                  rows={12}
                  className="mt-1 w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm text-[#1d4b43] focus:border-[#1d4b43] focus:outline-none disabled:bg-[#f7f7fb]"
                />

                {activeTab === "DRAFT" && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleAction("approve")}
                      disabled={acting}
                      className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
                    >
                      {acting ? "Sending…" : "Approve & Send"}
                    </button>
                    <button
                      onClick={() => handleAction("reject")}
                      disabled={acting}
                      className="rounded border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-[#e7e4dc] bg-[#f7f7fb] py-24 text-sm text-[#4b5563]">
                Select an email from the list to preview and edit.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
