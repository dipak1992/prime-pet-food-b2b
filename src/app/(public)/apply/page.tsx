"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type WholesaleApplicationInput,
  wholesaleApplicationSchema,
} from "@/lib/validations/wholesaleApplication";

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WholesaleApplicationInput>({
    resolver: zodResolver(wholesaleApplicationSchema),
    defaultValues: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      businessType: "",
      taxId: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zip: "",
      monthlyOrderEstimate: undefined,
      notes: "",
    },
  });

  async function onSubmit(values: WholesaleApplicationInput) {
    setError(null);
    const response = await fetch("/api/wholesale-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      setError("Could not submit application. Please try again.");
      return;
    }

    setSubmitted(true);
    form.reset();
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#e7e4dc] bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logoedited.jpg"
            alt="Prime Pet Food Logo"
            width={120}
            height={120}
            className="h-24 w-24 object-contain"
          />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1d4b43]">Prime Pet Food Wholesale</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
          Apply for wholesale pricing
        </h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Takes about 2 minutes. Approved partners get protected pricing, MOQ and case-pack details,
          invoice-based ordering, and fast reorders in one portal.
        </p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          {[
            ["Review", "Most applications are reviewed within 1 business day."],
            ["Payment", "Invoice workflow with ACH preferred for approved accounts."],
            ["Access", "Wholesale pricing stays gated until approval."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="font-semibold text-[#111827]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#6b7280]">{copy}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Application received. We will review your business details and email next steps, usually within 1 business day.
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["businessName", "Business name"],
            ["contactName", "Contact name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["website", "Website"],
          ].map(([name, label]) => (
            <label key={name} className="flex flex-col gap-1 text-sm text-[#374151]">
              {label}
              <input
                type={name === "email" ? "email" : "text"}
                className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                {...form.register(name as keyof WholesaleApplicationInput)}
              />
            </label>
          ))}

          <label className="flex flex-col gap-1 text-sm text-[#374151]">
            Business type
            <select
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              {...form.register("businessType")}
            >
              <option value="">Select one</option>
              <option value="Pet store">Pet store</option>
              <option value="Groomer / salon">Groomer / salon</option>
              <option value="Dog daycare / boarding">Dog daycare / boarding</option>
              <option value="Veterinary clinic">Veterinary clinic</option>
              <option value="Boutique pet shop">Boutique pet shop</option>
              <option value="Distributor">Distributor</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm text-[#374151]">
            Tax ID / EIN (optional)
            <input
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              {...form.register("taxId")}
            />
          </label>

          {[
            ["addressLine1", "Store address"],
            ["addressLine2", "Address line 2 (optional)"],
            ["city", "City"],
            ["state", "State"],
            ["zip", "ZIP"],
          ].map(([name, label]) => (
            <label key={name} className="flex flex-col gap-1 text-sm text-[#374151]">
              {label}
              <input
                className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                {...form.register(name as keyof WholesaleApplicationInput)}
              />
            </label>
          ))}

          <label className="flex flex-col gap-1 text-sm text-[#374151]">
            Monthly wholesale estimate (optional)
            <select
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              {...form.register("monthlyOrderEstimate", {
                setValueAs: (value) => (value === "" ? undefined : Number(value)),
              })}
            >
              <option value="">Select a range</option>
              <option value="250">Under $250</option>
              <option value="500">$250-$500</option>
              <option value="1000">$500-$1,000</option>
              <option value="1500">$1,000+</option>
            </select>
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1 text-sm text-[#374151]">
            Message / notes
            <textarea
              rows={4}
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              placeholder="Tell us what you sell, whether you need samples, or what case volumes you are considering."
              {...form.register("notes")}
            />
          </label>

          <p className="sm:col-span-2 text-xs leading-5 text-[#6b7280]">
            We use this information to verify wholesale eligibility and set up the right buying account.
            Pricing remains private until approval.
          </p>

          <button
            type="submit"
            className="sm:col-span-2 mt-2 inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Submit application
          </button>
        </form>
      </div>
    </div>
  );
}
