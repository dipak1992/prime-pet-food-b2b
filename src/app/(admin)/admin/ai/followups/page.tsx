"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FollowUpTask {
  id: string;
  type: string;
  subject: string | null;
  draftContent: string | null;
  status: string;
  scheduledFor: string | null;
  createdAt: string;
  leadId: string | null;
  customerId: string | null;
  lead: {
    id: string;
    businessName: string;
    contactName: string | null;
    email: string | null;
  } | null;
  customer: {
    id: string;
    businessName: string;
    user: { email: string };
  } | null;
}

type StatusTab = "pending" | "sent" | "skipped";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FollowUpsPage() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("pending");
  const [selected, setSelected] = useState<FollowUpTask | null>(null);
  const [editContent, setEditContent] = useState("");
  const [acting, setActing] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ---- Fetch tasks ---- */
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ai/followups?status=${activeTab}`);
      if (!res.ok) throw new Error("Failed to load follow-up tasks");
      const json = await res.json();
      setTasks(json.tasks ?? []);
    } catch {
      setMessage({ type: "error", text: "Failed to load follow-up tasks." });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTasks();
    setSelected(null);
  }, [fetchTasks]);

  /* ---- Select a task ---- */
  function selectTask(task: FollowUpTask) {
    setSelected(task);
    setEditContent(task.draftContent ?? "");
    setMessage(null);
  }

  /* ---- Run agent ---- */
  async function handleProcess() {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "follow_up" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setMessage({ type: "success", text: "Follow-up tasks processed successfully." });
      await fetchTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Run failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setRunning(false);
    }
  }

  /* ---- Approve / Skip ---- */
  async function handleAction(action: "approve" | "skip") {
    if (!selected) return;
    setActing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/followups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selected.id,
          action,
          editedContent: editContent,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      setMessage({
        type: "success",
        text: action === "approve" ? "Follow-up approved & sent." : "Follow-up skipped.",
      });
      setSelected(null);
      await fetchTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setActing(false);
    }
  }

  /* ---- Helpers ---- */
  function recipientName(task: FollowUpTask): string {
    if (task.lead) return task.lead.businessName;
    if (task.customer) return task.customer.businessName;
    return "Unknown";
  }

  function recipientEmail(task: FollowUpTask): string | null {
    if (task.lead?.email) return task.lead.email;
    if (task.customer?.user?.email) return task.customer.user.email;
    return null;
  }

  const tabs: StatusTab[] = ["pending", "sent", "skipped"];

  function tabClass(tab: StatusTab) {
    return tab === activeTab
      ? "rounded-t border border-b-0 border-[#e7e4dc] bg-white px-4 py-2 text-sm font-semibold text-[#1d4b43] capitalize"
      : "rounded-t border border-transparent px-4 py-2 text-sm font-medium text-[#4b5563] hover:text-[#1d4b43] capitalize";
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
            <h1 className="text-2xl font-bold text-[#1d4b43]">Follow-Up Queue</h1>
          </div>
          <p className="mt-1 text-sm text-[#4b5563]">
            Review and approve AI-generated follow-up messages for leads and customers.
          </p>
        </div>

        <button
          onClick={handleProcess}
          disabled={running}
          className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
        >
          {running ? "Processing…" : "Process Follow-Ups"}
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

      {/* ---- Content ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d4b43] border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#4b5563]">
          No {activeTab} follow-up tasks found.
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isOpen = selected?.id === task.id;
            const name = recipientName(task);
            const email = recipientEmail(task);

            return (
              <div
                key={task.id}
                className={`rounded-xl border shadow-sm transition ${
                  isOpen ? "border-[#1d4b43] bg-white" : "border-[#e7e4dc] bg-white"
                }`}
              >
                {/* ---- Card header (always visible) ---- */}
                <button
                  onClick={() => (isOpen ? setSelected(null) : selectTask(task))}
                  className="flex w-full items-start justify-between gap-4 p-5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1d4b43]">{name}</span>
                      {email && (
                        <span className="text-xs text-[#4b5563]">({email})</span>
                      )}
                      <span className="rounded bg-[#f7f7fb] px-2 py-0.5 text-xs text-[#4b5563]">
                        {task.type}
                      </span>
                    </div>
                    {task.scheduledFor && (
                      <div className="mt-1 text-xs text-[#4b5563]">
                        Scheduled: {new Date(task.scheduledFor).toLocaleDateString()}
                      </div>
                    )}
                    {task.subject && (
                      <div className="mt-1 text-sm font-medium text-[#1d4b43]">
                        {task.subject}
                      </div>
                    )}
                    {!isOpen && task.draftContent && (
                      <p className="mt-1 line-clamp-2 text-xs text-[#4b5563]">
                        {task.draftContent}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm text-[#4b5563]">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {/* ---- Expanded editor ---- */}
                {isOpen && (
                  <div className="border-t border-[#e7e4dc] p-5">
                    <label className="block text-xs font-medium text-[#4b5563]">
                      Draft Content
                    </label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      disabled={activeTab !== "pending"}
                      rows={8}
                      className="mt-1 w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm text-[#1d4b43] focus:border-[#1d4b43] focus:outline-none disabled:bg-[#f7f7fb]"
                    />

                    {activeTab === "pending" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => handleAction("approve")}
                          disabled={acting}
                          className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
                        >
                          {acting ? "Sending…" : "Approve & Send"}
                        </button>
                        <button
                          onClick={() => handleAction("skip")}
                          disabled={acting}
                          className="rounded border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-semibold text-[#4b5563] hover:bg-[#f7f7fb] disabled:opacity-50"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
