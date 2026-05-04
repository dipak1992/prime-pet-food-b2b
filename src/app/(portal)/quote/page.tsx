"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

export default function QuoteRequestPage() {
  const [requestType, setRequestType] = useState("CUSTOM_PRICING");
  const [businessNeed, setBusinessNeed] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [targetSkus, setTargetSkus] = useState("");
  const [timeline, setTimeline] = useState("This month");
  const [shippingZip, setShippingZip] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: requestType,
          subject:
            requestType === "SAMPLE_REQUEST"
              ? "Sample pack request"
              : requestType === "SALES_REP"
                ? "Sales consultation request"
                : "Custom wholesale quote request",
          message: [
            `Request type: ${requestType}`,
            `Business need: ${businessNeed}`,
            monthlyVolume ? `Expected monthly volume: ${monthlyVolume}` : "",
            targetSkus ? `Target SKUs / products: ${targetSkus}` : "",
            timeline ? `Timeline: ${timeline}` : "",
            shippingZip ? `Shipping ZIP: ${shippingZip}` : "",
            notes ? `Notes: ${notes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Could not submit request");
      }

      setSuccess("Request submitted. Our wholesale team will follow up with next steps.");
      setBusinessNeed("");
      setMonthlyVolume("");
      setTargetSkus("");
      setTimeline("This month");
      setShippingZip("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SectionCard title="Quote & sample request" description="Request custom pricing, samples, or sales help.">
      <div className="space-y-4">
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}{" "}
            <Link href="/support" className="font-semibold underline">
              View request
            </Link>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-[#111827]">
            Request type
            <select
              value={requestType}
              onChange={(event) => setRequestType(event.target.value)}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
            >
              <option value="CUSTOM_PRICING">Custom pricing / volume quote</option>
              <option value="SAMPLE_REQUEST">Sample pack</option>
              <option value="SALES_REP">Talk to sales</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[#111827]">
            Expected monthly volume
            <select
              value={monthlyVolume}
              onChange={(event) => setMonthlyVolume(event.target.value)}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
            >
              <option value="">Select a range</option>
              <option value="Under $250">Under $250</option>
              <option value="$250-$500">$250-$500</option>
              <option value="$500-$1,000">$500-$1,000</option>
              <option value="$1,000+">$1,000+</option>
            </select>
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-[#111827]">
            What do you need?
            <textarea
              value={businessNeed}
              onChange={(event) => setBusinessNeed(event.target.value)}
              required
              rows={3}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
              placeholder="Example: We want a starter assortment for two retail locations."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[#111827]">
            SKUs or product types
            <input
              value={targetSkus}
              onChange={(event) => setTargetSkus(event.target.value)}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
              placeholder="Small chews, mixed case, best sellers..."
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[#111827]">
            Timeline
            <select
              value={timeline}
              onChange={(event) => setTimeline(event.target.value)}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
            >
              <option>This week</option>
              <option>This month</option>
              <option>Next 60 days</option>
              <option>Just researching</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-[#111827]">
            Shipping ZIP
            <input
              value={shippingZip}
              onChange={(event) => setShippingZip(event.target.value)}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
              placeholder="ZIP"
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-[#111827]">
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
              placeholder="Add delivery constraints, preferred case mix, or sales questions."
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 rounded-lg bg-[#1d4b43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </SectionCard>
  );
}
