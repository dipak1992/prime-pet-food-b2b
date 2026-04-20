"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ADMIN_EMAILS = new Set(["admin@theprimepetfood.com", "admin@theperimeprtfood.com"]);
const DISPLAY_ADMIN_EMAIL = "admin@theprimepetfood.com";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleMagicLink(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    // Validate that email is admin email
    if (!ADMIN_EMAILS.has(email.toLowerCase())) {
      setError(`Only ${DISPLAY_ADMIN_EMAIL} can access the admin portal.`);
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, mode: "admin" }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || "Could not send magic link. Please try again.");
      return;
    }

    setMessage("Magic link sent to your admin email. It will expire in 60 seconds.");
    setEmail("");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-[#e7e4dc] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logoedited.jpg"
            alt="Prime Pet Food Logo"
            width={100}
            height={100}
            className="h-20 w-20 object-contain"
          />
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight text-[#1d4b43]">Prime Pet Food Admin Portal</h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Enter your admin email to receive a secure magic link.
        </p>
        <p className="mt-2 text-xs text-[#9b1c1c]">Magic link expires in 60 seconds.</p>

        {message && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleMagicLink} className="mt-6 space-y-4">
          <label className="flex flex-col gap-1 text-sm text-[#374151]">
            Admin Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={DISPLAY_ADMIN_EMAIL}
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              disabled={isLoading}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        <div className="mt-6 border-t border-[#e7e4dc] pt-4">
          <Link href="/" className="text-sm text-[#1d4b43] hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
