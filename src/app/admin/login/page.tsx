"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ADMIN_EMAILS = new Set(["admin@theprimepetfood.com", "admin@theperimeprtfood.com"]);
const DISPLAY_ADMIN_EMAIL = "admin@theprimepetfood.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validate that email is admin email
    if (!ADMIN_EMAILS.has(email.toLowerCase())) {
      setError(`Only ${DISPLAY_ADMIN_EMAIL} can access the admin portal.`);
      setIsLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message || "Login failed. Please check your credentials.");
      return;
    }

    router.push("/admin");
    router.refresh();
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
          Sign in with admin email and password.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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

          <label className="flex flex-col gap-1 text-sm text-[#374151]">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-[#d6d3cc] px-3 py-2 outline-none ring-[#1d4b43] focus:ring-2"
              disabled={isLoading}
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in"}
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
