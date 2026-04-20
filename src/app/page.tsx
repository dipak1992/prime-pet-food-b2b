import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#f9f2df_0%,#f8f7f4_45%,#eef6f3_100%)]">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <Image
          src="/logo.jpg"
          alt="Prime Pet Food Logo"
          width={120}
          height={120}
          className="mb-6 h-24 w-24 object-contain"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1d4b43]">Prime Pet Food</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#111827] sm:text-5xl">
          Simple, premium wholesale ordering for approved B2B buyers.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-[#4b5563] sm:text-lg">
          Apply once, get approved, and reorder your best-selling Himalayan Yak Cheese treats in minutes.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-3 text-sm font-semibold text-white"
          >
            Apply for wholesale
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937]"
          >
            Wholesale login
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["Approved-only pricing", "Wholesale prices and bundles are visible only to approved accounts."],
            ["Fast reorder workflow", "Reorder from last order or order history with case-pack-aware quantities."],
            ["Built for busy stores", "Simple mobile-friendly UI for pet shops, groomers, and clinics."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-[#e5e7eb] bg-white/90 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
              <p className="mt-2 text-sm text-[#6b7280]">{description}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
