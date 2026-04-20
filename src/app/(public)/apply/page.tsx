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
      monthlyOrderEstimate: 0,
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
            src="/logo.jpg"
            alt="Prime Pet Food Logo"
            width={120}
            height={120}
            className="h-24 w-24 object-contain"
          />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1d4b43]">Prime Pet Food Wholesale</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827] sm:text-4xl">
          Apply for a wholesale account
        </h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Approved partners get wholesale pricing, fast reorders, and order tracking in one portal.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Application received. We will review it and email you once approved.
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
            ["businessType", "Business type"],
            ["taxId", "Tax ID / EIN (optional)"],
            ["addressLine1", "Store address"],
            ["addressLine2", "Address line 2 (optional)"],
            ["city", "City"],
            ["state", "State"],
            ["zip", "ZIP"],
            ["monthlyOrderEstimate", "Monthly order estimate (USD)"],
          ].map(([name, label]) => (
            <label key={name} className="flex flex-col gap-1 text-sm text-[#374151]">
              {label}
              <input
                type={name === "email" ? "email" : name === "monthlyOrderEstimate" ? "number" : "text"}
                className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
                {...form.register(name as keyof WholesaleApplicationInput, {
                  valueAsNumber: name === "monthlyOrderEstimate",
                })}
              />
            </label>
          ))}

          <label className="sm:col-span-2 flex flex-col gap-1 text-sm text-[#374151]">
            Message / notes
            <textarea
              rows={4}
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              {...form.register("notes")}
            />
          </label>

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
