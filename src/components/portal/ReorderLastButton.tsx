"use client";

import { useState } from "react";
import Link from "next/link";

export function ReorderLastButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function reorder() {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/cart/reorder-last", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Could not reorder");
      setMessage(payload.message || "Order added to cart.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reorder");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={reorder}
        disabled={loading}
        className="w-full rounded-lg bg-[#1d4b43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
      >
        {loading ? "Adding..." : "Reorder Last Order"}
      </button>
      {message && (
        <p className="text-xs text-green-700">
          {message}{" "}
          <Link href="/cart" className="font-semibold underline">
            View cart
          </Link>
        </p>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
