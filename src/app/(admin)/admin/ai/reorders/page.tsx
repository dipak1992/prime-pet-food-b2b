"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Prediction {
  id: string;
  customerId: string;
  businessName: string;
  email: string;
  tier: string;
  predictedDate: string;
  confidence: number;
  urgency: "overdue" | "high" | "medium" | "low";
  reasoning: string;
  suggestedProducts: string[];
  estimatedValue: number;
  lastOrderDate: string;
  lastOrderAmount: number;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const urgencyColors: Record<string, string> = {
  overdue: "border-red-300 bg-red-50 text-red-700",
  high: "border-orange-300 bg-orange-50 text-orange-700",
  medium: "border-yellow-300 bg-yellow-50 text-yellow-700",
  low: "border-green-300 bg-green-50 text-green-700",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ReordersPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /* ---- Fetch predictions ---- */
  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/reorders");
      if (!res.ok) throw new Error("Failed to load predictions");
      const json = await res.json();
      setPredictions(json.predictions ?? []);
    } catch {
      setMessage({ type: "error", text: "Failed to load reorder predictions." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  /* ---- Run agent ---- */
  async function handleRunPredictions() {
    setRunning(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: "reorder_predictor" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setMessage({
        type: "success",
        text: "Reorder predictions generated successfully.",
      });
      await fetchPredictions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Run failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setRunning(false);
    }
  }

  /* ---- Actions: notify / dismiss ---- */
  async function handleAction(
    predictionId: string,
    action: "notify" | "dismiss"
  ) {
    setActingId(predictionId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ai/reorders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Action failed");
      setMessage({
        type: "success",
        text:
          action === "notify"
            ? "Reminder sent successfully."
            : "Prediction dismissed.",
      });
      await fetchPredictions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      setMessage({ type: "error", text: msg });
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex flex-wrap items-start justify-between gap-4">
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
              AI Reorder Predictions
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#4b5563]">
            AI-predicted reorder opportunities based on customer purchase
            patterns and product lifecycle data.
          </p>
        </div>

        <button
          onClick={handleRunPredictions}
          disabled={running}
          className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
        >
          {running ? "Running…" : "Run Predictions"}
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

      {/* ---- Content ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1d4b43] border-t-transparent" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#4b5563]">
          No reorder predictions found. Click &quot;Run Predictions&quot; to
          generate new ones.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {predictions.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm"
            >
              {/* ---- Top row: customer info + urgency ---- */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#1d4b43]">
                    {p.businessName}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#4b5563]">{p.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded bg-[#f7f7fb] px-2 py-0.5 text-xs font-medium text-[#4b5563]">
                    {p.tier}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      urgencyColors[p.urgency] ?? urgencyColors.low
                    }`}
                  >
                    {p.urgency}
                  </span>
                </div>
              </div>

              {/* ---- Predicted date & confidence ---- */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-medium text-[#4b5563]">
                    Predicted Reorder
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-[#1d4b43]">
                    {formatDate(p.predictedDate)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4b5563]">
                    Confidence
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e7e4dc]">
                      <div
                        className="h-full rounded-full bg-[#1d4b43]"
                        style={{ width: `${Math.round(p.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#1d4b43]">
                      {Math.round(p.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* ---- Reasoning ---- */}
              <div className="mt-3">
                <span className="text-xs font-medium text-[#4b5563]">
                  Reasoning
                </span>
                <p className="mt-0.5 text-sm text-[#4b5563]">{p.reasoning}</p>
              </div>

              {/* ---- Suggested products ---- */}
              {p.suggestedProducts.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-[#4b5563]">
                    Suggested Products
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {p.suggestedProducts.map((product, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-[#f7f7fb] px-2.5 py-0.5 text-xs text-[#4b5563]"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ---- Order info row ---- */}
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#e7e4dc] pt-3">
                <div>
                  <span className="text-xs font-medium text-[#4b5563]">
                    Est. Value
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-[#1d4b43]">
                    {formatCurrency(p.estimatedValue)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4b5563]">
                    Last Order
                  </span>
                  <p className="mt-0.5 text-sm text-[#1d4b43]">
                    {formatDate(p.lastOrderDate)}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#4b5563]">
                    Last Amount
                  </span>
                  <p className="mt-0.5 text-sm text-[#1d4b43]">
                    {formatCurrency(p.lastOrderAmount)}
                  </p>
                </div>
              </div>

              {/* ---- Action buttons ---- */}
              <div className="mt-4 flex gap-3 border-t border-[#e7e4dc] pt-4">
                <button
                  onClick={() => handleAction(p.id, "notify")}
                  disabled={actingId === p.id}
                  className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
                >
                  {actingId === p.id ? "Sending…" : "Send Reminder"}
                </button>
                <button
                  onClick={() => handleAction(p.id, "dismiss")}
                  disabled={actingId === p.id}
                  className="rounded border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-semibold text-[#4b5563] hover:bg-[#f7f7fb] disabled:opacity-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
