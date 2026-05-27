"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AgentConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  schedule: string;
  maxRunsPerDay: number;
  requiresApproval: boolean;
  lastRunAt: string | null;
}

interface GlobalConfig {
  provider: string;
  model: string;
  maxEmailsPerDay: number;
  maxLeadsPerRun: number;
  autoSendOutreach: boolean;
  businessHoursOnly: boolean;
  dedupWindowHours: number;
}

interface SettingsData {
  config: GlobalConfig;
  agents: AgentConfig[];
  totalRunsToday: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ---- Fetch settings ---- */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      const json: SettingsData = await res.json();
      setData(json);
    } catch {
      setMessage({ type: "error", text: "Failed to load AI settings." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /* ---- Toggle agent enabled ---- */
  async function handleToggle(agent: AgentConfig) {
    setTogglingId(agent.id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          enabled: !agent.enabled,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      setMessage({
        type: "success",
        text: `${agent.name} ${!agent.enabled ? "enabled" : "disabled"} successfully.`,
      });
      await fetchSettings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setTogglingId(null);
    }
  }

  /* ---- Format last run ---- */
  function formatLastRun(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/ai"
            className="text-sm text-[#4b5563] hover:underline"
          >
            AI Growth Center
          </Link>
          <span className="text-sm text-[#4b5563]">/</span>
          <h1 className="text-2xl font-bold text-[#1d4b43]">
            AI Agent Settings
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#4b5563]">
          Configure AI agents, safety limits, and scheduling for your automated
          growth workflows.
        </p>
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

      {/* ---- Loading ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d4b43] border-t-transparent" />
        </div>
      ) : !data ? (
        <div className="py-16 text-center text-sm text-[#4b5563]">
          Unable to load settings.
        </div>
      ) : (
        <>
          {/* ---- Global Config ---- */}
          <div className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1d4b43]">
              Global Configuration
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Core AI provider settings and safety limits.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Provider */}
              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Provider
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.config.provider}
                </p>
              </div>

              {/* Model */}
              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Model
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.config.model}
                </p>
              </div>

              {/* Runs today */}
              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Runs Today
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.totalRunsToday}
                </p>
              </div>

              {/* Max emails/day */}
              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Max Emails / Day
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.config.maxEmailsPerDay}
                </p>
              </div>

              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Auto-send Outreach
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.config.autoSendOutreach ? "Yes" : "No"}
                </p>
              </div>

              {/* Business hours */}
              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Business Hours Only
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.config.businessHoursOnly ? "Yes" : "No"}
                </p>
              </div>

              {/* Dedup window */}
              <div className="rounded-lg border border-[#e7e4dc] bg-[#f7f7fb] p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-[#4b5563]">
                  Dedup Window
                </span>
                <p className="mt-1 text-sm font-semibold text-[#1d4b43]">
                  {data.config.dedupWindowHours}h
                </p>
              </div>
            </div>
          </div>

          {/* ---- Agent List ---- */}
          <div>
            <h2 className="text-lg font-semibold text-[#1d4b43]">
              AI Agents
            </h2>
            <p className="mt-1 text-sm text-[#4b5563]">
              Enable or disable individual agents and view their schedules.
            </p>

            <div className="mt-4 space-y-3">
              {data.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* ---- Agent info ---- */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#1d4b43]">
                          {agent.name}
                        </h3>
                        {agent.requiresApproval && (
                          <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Requires Approval
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            agent.enabled
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {agent.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#4b5563]">
                        {agent.description}
                      </p>

                      {/* ---- Meta row ---- */}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#4b5563]">
                        <div>
                          <span className="font-medium">Schedule:</span>{" "}
                          <code className="rounded bg-[#f7f7fb] px-1.5 py-0.5 text-[11px]">
                            {agent.schedule}
                          </code>
                        </div>
                        <div>
                          <span className="font-medium">Max Runs/Day:</span>{" "}
                          {agent.maxRunsPerDay}
                        </div>
                        <div>
                          <span className="font-medium">Last Run:</span>{" "}
                          {formatLastRun(agent.lastRunAt)}
                        </div>
                      </div>
                    </div>

                    {/* ---- Toggle switch ---- */}
                    <button
                      onClick={() => handleToggle(agent)}
                      disabled={togglingId === agent.id}
                      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: agent.enabled
                          ? "#1d4b43"
                          : "#e7e4dc",
                      }}
                      role="switch"
                      aria-checked={agent.enabled}
                      aria-label={`Toggle ${agent.name}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                          agent.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
