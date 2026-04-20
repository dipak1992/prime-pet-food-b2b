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

        <div className="mt-12 rounded-3xl border border-[#e5e7eb] bg-white/95 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">About Himalayan Yak Cheese Chews</h2>
          <p className="mt-4 text-base text-[#4b5563] leading-relaxed max-w-3xl">
            Our premium Himalayan Yak Cheese chews are a natural, long-lasting treat loved by pet retailers and veterinarians worldwide. Sourced from the pristine Himalayas, these hard cheese chews are packed with protein, low in fat, and completely free from additives—making them a healthy choice for every dog.
          </p>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "100% Natural", detail: "No artificial ingredients, preservatives, or fillers. Pure Himalayan yak & cow milk cheese." },
              { label: "Long-lasting", detail: "Keeps dogs engaged for hours, perfect for dental health and behavioral enrichment." },
              { label: "High protein", detail: "Packed with amino acids and natural enzymes to support digestive and immune health." },
              { label: "Wholesale ready", detail: "Available in case packs, bulk bundles, and mixed assortments for retail and clinic resale." },
            ].map(({ label, detail }) => (
              <div key={label} className="border-l-2 border-[#1d4b43] pl-4">
                <p className="font-semibold text-[#1d4b43]">{label}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-[#6b7280]">
            Join hundreds of pet shops, grooming salons, and veterinary clinics already stocking Prime Pet Food Himalayan Yak Cheese chews. Get started with wholesale pricing today.
          </p>
        </div>
      </main>
    </div>
  );
}
