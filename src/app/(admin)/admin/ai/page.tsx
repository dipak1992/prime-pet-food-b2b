"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule?: string | null;
  maxRunsPerDay: number;
  requiresApproval: boolean;
  lastRunAt?: string | null;
}

interface RunStat {
  agentId: string;
  status: string;
  _count: number;
}

interface SettingsPayload {
  config: {
    globalEnabled: boolean;
    provider: string;
    model: string;
    safetyLimits: Record<string, unknown>;
  };
  agents: Agent[];
  runsToday: RunStat[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function runsForAgent(agentId: string, runsToday: RunStat[]): number {
  return runsToday
    .filter((r) => r.agentId === agentId)
    .reduce((sum, r) => sum + r._count, 0);
}

function agentLink(id: string): string {
  const map: Record<string, string> = {
    lead_finder: "/admin/ai/leads",
    lead_qualifier: "/admin/ai/leads",
    outreach_drafter: "/admin/ai/outreach",
    follow_up: "/admin/ai/followups",
    reorder_predictor: "/admin/reorders",
    churn_detector: "/admin/analytics",
    sales_copilot: "/admin/ai/copilot",
  };
  return map[id] ?? "/admin/ai";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AiOverviewPage() {
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const json: SettingsPayload = await res.json();
      setData(json);
    } catch {
      setMessage({ type: "error", text: "Failed to load AI settings." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRun(agentId: string) {
    setRunningAgent(agentId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setMessage({ type: "success", text: `Agent "${agentId}" ran successfully.` });
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Run failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setRunningAgent(null);
    }
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d4b43] border-t-transparent" />
      </div>
    );
  }

  const agents = data?.agents ?? [];
  const runsToday = data?.runsToday ?? [];

  return (
    <div className="space-y-8">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d4b43]">AI Growth Center</h1>
          <p className="mt-1 text-sm text-[#4b5563]">
            Manage AI-powered agents that find leads, draft outreach, and automate follow-ups.
          </p>
        </div>
        <Link
          href="/admin/ai/settings"
          className="rounded border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-semibold text-[#1d4b43] hover:bg-[#f7f7fb]"
        >
          ⚙️ Settings
        </Link>
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

      {/* ---- Agent cards grid ---- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#1d4b43]">Agents</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const runs = runsForAgent(agent.id, runsToday);
            const isRunning = runningAgent === agent.id;

            return (
              <div
                key={agent.id}
                className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm"
              >
                {/* name + badge */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#1d4b43]">{agent.name}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      agent.enabled
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {agent.enabled ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#4b5563]">{agent.description}</p>

                {/* stats */}
                <div className="mt-4 flex items-center gap-4 text-xs text-[#4b5563]">
                  <span>
                    Runs today:{" "}
                    <strong className="text-[#1d4b43]">{runs}</strong>
                  </span>
                  {agent.lastRunAt && (
                    <span>
                      Last run:{" "}
                      <strong className="text-[#1d4b43]">
                        {new Date(agent.lastRunAt).toLocaleString()}
                      </strong>
                    </span>
                  )}
                </div>

                {/* actions */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => handleRun(agent.id)}
                    disabled={isRunning || !!runningAgent}
                    className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
                  >
                    {isRunning ? "Running…" : "Run Now"}
                  </button>
                  <Link
                    href={agentLink(agent.id)}
                    className="text-sm font-medium text-[#1d4b43] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Quick-link cards ---- */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#1d4b43]">Quick Links</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Outreach Queue",
              description: "Review and send AI-drafted outreach emails.",
              href: "/admin/ai/outreach",
              icon: "📧",
            },
            {
              title: "Follow-Up Queue",
              description: "Manage pending follow-up tasks and approve sends.",
              href: "/admin/ai/followups",
              icon: "🔄",
            },
            {
              title: "Sales Copilot",
              description: "Chat with AI to get business insights and recommendations.",
              href: "/admin/ai/copilot",
              icon: "🤖",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm transition hover:border-[#1d4b43]/30 hover:shadow-md"
            >
              <div className="mb-2 text-2xl">{card.icon}</div>
              <h3 className="font-semibold text-[#1d4b43]">{card.title}</h3>
              <p className="mt-1 text-sm text-[#4b5563]">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
