"use client";

import { useState } from "react";
import Link from "next/link";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import RelatedLinks from "@/components/seo/RelatedLinks";
import { calculateProfit, calculatorPresets } from "@/content/seo/leadMagnets";

const relatedLinks = [
  { label: "Best High-Margin Dog Treats for Pet Stores", href: "/best-high-margin-dog-treats-for-pet-stores" },
  { label: "Wholesale Dog Chews for Pet Stores", href: "/wholesale-dog-chews-for-pet-stores" },
  { label: "Yak Chews vs Rawhide for Retailers", href: "/yak-chews-vs-rawhide-for-retailers" },
  { label: "Apply for Wholesale Account", href: "/apply" },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatPercent(n: number) {
  return `${n.toFixed(1)}%`;
}

export default function DogTreatProfitCalculatorPage() {
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calculator state
  const [wholesaleCost, setWholesaleCost] = useState(6.5);
  const [retailPrice, setRetailPrice] = useState(14.99);
  const [unitsPerCase, setUnitsPerCase] = useState(18);
  const [unitsSoldPerMonth, setUnitsSoldPerMonth] = useState(40);
  const [shelfFeet, setShelfFeet] = useState(2);
  const [selectedPreset, setSelectedPreset] = useState(1);

  const results = calculateProfit({
    wholesaleCostPerUnit: wholesaleCost,
    retailPricePerUnit: retailPrice,
    unitsPerCase,
    unitsSoldPerMonth,
    shelfFeetUsed: shelfFeet,
  });

  function applyPreset(index: number) {
    const p = calculatorPresets[index];
    setSelectedPreset(index);
    setWholesaleCost(p.wholesaleCostPerUnit);
    setRetailPrice(p.retailPricePerUnit);
    setUnitsPerCase(p.unitsPerCase);
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !businessName || !businessType) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await fetch("/api/seo/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          businessName,
          businessType,
          sourcePage: "/dog-treat-profit-calculator",
          intentType: "calculator",
        }),
      });
      setUnlocked(true);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Resources", href: "/wholesale" },
            { label: "Profit Calculator" },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
          Free Tool for Pet Store Owners
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Dog Treat Profit Calculator for Pet Stores
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4b5563] sm:text-lg">
          See your exact gross margin on yak cheese chews and other dog treats before you place a wholesale order.
        </p>

        {/* Value bullets */}
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {[
            "Calculate gross margin percentage on any dog treat",
            "Compare margin across multiple products",
            "See profit per linear foot of shelf space",
            "Estimate monthly and annual gross profit",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[#374151]">
              <span className="mt-0.5 text-[#ea580c]">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Gate / Calculator */}
      <section className="border-t border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-4xl px-6">
          {!unlocked ? (
            /* Lead capture gate */
            <div className="mx-auto max-w-lg rounded-2xl border border-[#e7e4dc] bg-[#fcfbf9] p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#111827]">
                Enter your details to access the calculator
              </h2>
              <p className="mt-2 text-sm text-[#6b7280]">
                Free for pet store owners, groomers, and wholesale buyers.
              </p>
              <form onSubmit={handleUnlock} className="mt-6 space-y-4">
                <label className="flex flex-col gap-1 text-sm text-[#374151]">
                  Business email
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourpetstore.com"
                    className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[#374151]">
                  Business name
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Pet Store"
                    className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-[#374151]">
                  Business type
                  <select
                    required
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                  >
                    <option value="">Select one</option>
                    <option>Independent pet store</option>
                    <option>Groomer / salon</option>
                    <option>Dog daycare / boarding</option>
                    <option>Veterinary clinic</option>
                    <option>Boutique pet shop</option>
                    <option>Distributor</option>
                    <option>Other</option>
                  </select>
                </label>
                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c] disabled:opacity-60"
                >
                  {submitting ? "Loading…" : "Access the free calculator →"}
                </button>
                <p className="text-center text-xs text-[#9ca3af]">
                  No spam. We may follow up with wholesale pricing information.
                </p>
              </form>
            </div>
          ) : (
            /* Calculator */
            <div className="space-y-8">
              <div className="rounded-2xl border border-[#e7e4dc] bg-[#fff7ed] p-4">
                <p className="text-sm font-semibold text-[#ea580c]">
                  Calculator unlocked! Use the presets below or enter your own numbers.
                </p>
              </div>

              {/* Presets */}
              <div>
                <p className="mb-3 text-sm font-semibold text-[#374151]">Quick presets</p>
                <div className="flex flex-wrap gap-2">
                  {calculatorPresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(i)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedPreset === i
                          ? "border-[#ea580c] bg-[#ea580c] text-white"
                          : "border-[#e7e4dc] bg-white text-[#374151] hover:border-[#ea580c]/40"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Inputs */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-[#111827]">Your numbers</h2>
                  {[
                    {
                      label: "Wholesale cost per unit ($)",
                      value: wholesaleCost,
                      setter: setWholesaleCost,
                      step: 0.01,
                      min: 0.01,
                    },
                    {
                      label: "Retail price per unit ($)",
                      value: retailPrice,
                      setter: setRetailPrice,
                      step: 0.01,
                      min: 0.01,
                    },
                    {
                      label: "Units per case",
                      value: unitsPerCase,
                      setter: setUnitsPerCase,
                      step: 1,
                      min: 1,
                    },
                    {
                      label: "Units sold per month",
                      value: unitsSoldPerMonth,
                      setter: setUnitsSoldPerMonth,
                      step: 1,
                      min: 0,
                    },
                    {
                      label: "Shelf feet used",
                      value: shelfFeet,
                      setter: setShelfFeet,
                      step: 0.5,
                      min: 0.5,
                    },
                  ].map(({ label, value, setter, step, min }) => (
                    <label key={label} className="flex flex-col gap-1 text-sm text-[#374151]">
                      {label}
                      <input
                        type="number"
                        value={value}
                        step={step}
                        min={min}
                        onChange={(e) => setter(parseFloat(e.target.value) || 0)}
                        className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                      />
                    </label>
                  ))}
                </div>

                {/* Results */}
                <div>
                  <h2 className="mb-4 text-lg font-semibold text-[#111827]">Your results</h2>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Gross margin",
                        value: formatPercent(results.grossMarginPercent),
                        highlight: results.grossMarginPercent >= 40,
                      },
                      {
                        label: "Profit per unit",
                        value: formatCurrency(results.grossProfitPerUnit),
                        highlight: false,
                      },
                      {
                        label: "Profit per case",
                        value: formatCurrency(results.grossProfitPerCase),
                        highlight: false,
                      },
                      {
                        label: "Monthly gross profit",
                        value: formatCurrency(results.monthlyGrossProfit),
                        highlight: true,
                      },
                      {
                        label: "Profit per shelf foot / month",
                        value: formatCurrency(results.profitPerShelfFoot),
                        highlight: false,
                      },
                      {
                        label: "Annual gross profit",
                        value: formatCurrency(results.annualGrossProfit),
                        highlight: true,
                      },
                    ].map(({ label, value, highlight }) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                          highlight
                            ? "border-[#ea580c]/20 bg-[#fff7ed]"
                            : "border-[#e7e4dc] bg-[#fcfbf9]"
                        }`}
                      >
                        <span className="text-sm text-[#374151]">{label}</span>
                        <span
                          className={`text-sm font-bold ${
                            highlight ? "text-[#ea580c]" : "text-[#111827]"
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {results.grossMarginPercent >= 40 && (
                    <div className="mt-4 rounded-xl border border-[#ea580c]/20 bg-[#fff7ed] p-4">
                      <p className="text-sm font-semibold text-[#ea580c]">
                        Strong margin! Yak chews typically deliver 40–60% gross margin for pet stores.
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link
                      href="/apply"
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
                    >
                      Apply for wholesale pricing →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Links */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <RelatedLinks links={relatedLinks} />
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Ready to stock the highest-margin dog chew?
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for wholesale pricing on Himalayan yak cheese chews and start earning better margin.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f3f4f6]"
            >
              Apply for wholesale pricing
            </Link>
            <Link
              href="/wholesale-yak-cheese-dog-chews"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              View wholesale program
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
