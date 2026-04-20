"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Props = {
  isConnected: boolean;
  shopDomain: string | null;
};

export function ShopifySyncPanel({ isConnected, shopDomain }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Show feedback from OAuth redirect
  useEffect(() => {
    const status = searchParams.get("shopify");
    if (status === "connected") {
      setMessage({ type: "success", text: "Shopify connected successfully!" });
      router.replace("/admin/products");
    } else if (status === "error") {
      setMessage({ type: "error", text: "Shopify connection failed. Please try again." });
      router.replace("/admin/products");
    }
  }, [searchParams, router]);

  async function handleSync() {
    try {
      setSyncing(true);
      setMessage(null);
      const res = await fetch("/api/admin/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 250 }),
      });
      const data = await res.json() as { recordsUpserted?: number; message?: string };
      if (!res.ok) throw new Error(data.message ?? "Sync failed");
      setMessage({
        type: "success",
        text: `Sync complete — ${data.recordsUpserted ?? 0} products updated.`,
      });
      // Refresh page to show updated products
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Sync failed.",
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[#111827]">
          Shopify Integration
          {isConnected ? (
            <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Connected
            </span>
          ) : (
            <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
              Not Connected
            </span>
          )}
        </p>
        {isConnected && shopDomain && (
          <p className="mt-0.5 text-xs text-[#6b7280]">{shopDomain}</p>
        )}
        {!isConnected && (
          <p className="mt-0.5 text-xs text-[#6b7280]">
            Authorize your Shopify store to import products.
          </p>
        )}
        {message && (
          <p
            className={`mt-1.5 text-xs font-medium ${
              message.type === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      <div className="flex shrink-0 gap-2">
        {!isConnected ? (
          <a
            href="/api/shopify/install"
            className="inline-flex items-center rounded bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
          >
            Connect Shopify
          </a>
        ) : (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center rounded bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-60"
          >
            {syncing ? "Syncing..." : "Sync Products"}
          </button>
        )}
      </div>
    </div>
  );
}
