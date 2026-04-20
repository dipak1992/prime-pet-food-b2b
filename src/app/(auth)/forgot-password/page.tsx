"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [prefilledEmail] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return new URLSearchParams(window.location.search).get("email") || "";
  });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (resetError) {
      setError(resetError.message || "Unable to send reset email.");
      return;
    }

    setMessage("Password reset email sent. Please check your inbox.");
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

        <h1 className="text-2xl font-semibold tracking-tight text-[#1d4b43]">Reset password</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Enter your account email and we will send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="flex flex-col gap-1 text-sm text-[#374151]">
            Email
            <input
              type="email"
              required
              value={email || prefilledEmail}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              disabled={isLoading}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send reset email"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 border-t border-[#e7e4dc] pt-4">
          <Link href="/login" className="text-sm text-[#1d4b43] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
