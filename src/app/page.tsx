import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#f9f2df_0%,#f8f7f4_45%,#eef6f3_100%)]">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <Image
          src="/logoedited.jpg"
          alt="Prime Pet Food Logo"
          width={120}
          height={120}
          className="mb-6 h-24 w-24 object-contain"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1d4b43]">Prime Pet Food</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#111827] sm:text-5xl">
          Wholesale Himalayan Yak Chews built for retail margins.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-[#4b5563] sm:text-lg">
          Stock natural, long-lasting dog chews with protected wholesale pricing, case-pack ordering, and a portal built for fast reorders.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-3 text-sm font-semibold text-white"
          >
            Apply for wholesale
          </Link>
          <Link
            href="/wholesale"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937]"
          >
            See wholesale program
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937]"
          >
            Browse catalog
          </Link>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            ["Protected wholesale pricing", "Approved retailers see wholesale pricing, MSRP guidance, MOQ, and case-pack details."],
            ["Fast replenishment", "Reorder proven sellers from your order history with case-pack-aware quantities."],
            ["Retail-ready assortment", "Built for pet shops, groomers, daycare counters, vet clinics, and boutique shelves."],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-[#e5e7eb] bg-white/90 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
              <p className="mt-2 text-sm text-[#6b7280]">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-[#e5e7eb] bg-white/95 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Why retailers stock yak cheese chews</h2>
          <p className="mt-4 text-base text-[#4b5563] leading-relaxed max-w-3xl">
            Himalayan Yak Cheese chews are a simple, high-protein, long-lasting treat with strong shelf appeal and repeat-purchase potential. Approved buyers get case-pack ordering, invoice-based fulfillment, and merchandising assets for resale.
          </p>
          
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Simple ingredients", detail: "A straightforward natural chew story that is easy for staff to explain at the shelf." },
              { label: "Long-lasting value", detail: "A premium treat format that fits impulse buys, counter displays, and enrichment sections." },
              { label: "Clear case economics", detail: "Approved buyers see MOQ, case packs, MSRP, and wholesale unit pricing before ordering." },
              { label: "Invoice-first ordering", detail: "Submit order requests online; our team confirms availability and follows up with invoice details." },
            ].map(({ label, detail }) => (
              <div key={label} className="border-l-2 border-[#1d4b43] pl-4">
                <p className="font-semibold text-[#1d4b43]">{label}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-[#6b7280]">
            Apply for wholesale access to review pricing, build a case-pack order, and request support from the Prime Pet Food team.
          </p>
        </div>
      </main>
    </div>
  );
}
