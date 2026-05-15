import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import Link from "next/link";
import { stateData } from "@/content/seo/locationPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const BASE_URL = SITE_URL;

export const metadata: Metadata = {
  title: "Wholesale Yak Cheese Dog Chews by State | Prime Pet Food",
  description:
    "Find wholesale Himalayan yak cheese dog chew suppliers near you. Prime Pet Food ships to all 50 states. Browse by state to learn about shipping times and local wholesale programs.",
  alternates: { canonical: `${BASE_URL}/wholesale/locations` },
};

export default function WholesaleLocationsPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="WebPage"
        name="Wholesale Yak Cheese Dog Chews by State"
        description="Find wholesale Himalayan yak cheese dog chew suppliers near you."
        url={`${BASE_URL}/wholesale/locations`}
      />

      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Wholesale", href: "/wholesale" },
            { label: "Locations" },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
          Wholesale Locations
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Wholesale Yak Cheese Dog Chews — All States
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b5563]">
          Prime Pet Food ships wholesale Himalayan yak cheese dog chews to all 50 states. Browse your state for shipping times, local market information, and wholesale program details.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
          >
            Apply for wholesale pricing
          </Link>
          <Link
            href="/wholesale-yak-cheese-dog-chews"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fcfbf9]"
          >
            View wholesale program
          </Link>
        </div>
      </section>

      {/* State Grid */}
      <section className="border-t border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#111827]">
            Browse by state
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stateData.map((state) => (
              <Link
                key={state.slug}
                href={`/wholesale/locations/${state.slug}`}
                className="group rounded-2xl border border-[#e7e4dc] bg-[#fcfbf9] p-5 hover:border-[#ea580c]/30 hover:bg-[#fff7ed]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                      {state.code}
                    </p>
                    <p className="mt-1 text-base font-semibold text-[#111827] group-hover:text-[#ea580c]">
                      {state.name}
                    </p>
                  </div>
                  <span className="text-[#c7c2b5] group-hover:text-[#ea580c]">→</span>
                </div>
                <p className="mt-2 text-xs text-[#6b7280]">Ships in {state.shippingDays}</p>
                <p className="mt-1 text-xs text-[#6b7280]">
                  {state.majorCities.slice(0, 3).join(", ")}
                  {state.majorCities.length > 3 ? " + more" : ""}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#e7e4dc] bg-[#fcfbf9] p-6">
            <p className="text-sm font-semibold text-[#111827]">
              Don&apos;t see your state listed?
            </p>
            <p className="mt-2 text-sm text-[#4b5563]">
              We ship wholesale orders to all 50 states. Apply for a wholesale account and our team will confirm shipping details for your location.
            </p>
            <Link
              href="/apply"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c2410c]"
            >
              Apply for wholesale account
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Wholesale yak chews delivered to your door
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for a wholesale account and get protected pricing, case-pack ordering, and fast reorders.
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
