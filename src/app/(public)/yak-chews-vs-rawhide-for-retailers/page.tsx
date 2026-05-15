import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import Link from "next/link";
import { comparisonPages } from "@/content/seo/comparisonPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import ComparisonTable from "@/components/seo/ComparisonTable";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const page = comparisonPages.find((p) => p.slug === "yak-chews-vs-rawhide-for-retailers")!;
const BASE_URL = SITE_URL;

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.metaDescription,
  alternates: { canonical: `${BASE_URL}/${page.slug}` },
  openGraph: {
    title: page.seoTitle,
    description: page.metaDescription,
    url: `${BASE_URL}/${page.slug}`,
    type: "article",
  },
};

export default function YakChewsVsRawhidePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="Article"
        headline={page.h1}
        description={page.metaDescription}
        url={`${BASE_URL}/${page.slug}`}
      />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Wholesale Guides", href: "/wholesale" },
            { label: "Yak Chews vs Rawhide" },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
          Retailer Buying Guide
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {page.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4b5563] sm:text-lg">{page.subtitle}</p>
        <p className="mt-4 text-sm leading-7 text-[#4b5563]">{page.intro}</p>
      </section>

      {/* Comparison Table */}
      <section className="border-y border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#111827]">
            Side-by-side comparison for retailers
          </h2>
          <ComparisonTable
            rows={page.comparisonRows}
            competitorLabel={page.competitorName}
          />
        </div>
      </section>

      {/* Verdict */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border border-[#ea580c]/20 bg-[#fff7ed] p-6">
          <h2 className="text-xl font-semibold text-[#111827]">The retailer verdict</h2>
          <p className="mt-3 text-sm leading-7 text-[#374151]">{page.verdict}</p>
        </div>
        <div className="mt-6 rounded-2xl border border-[#e7e4dc] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#111827]">Retailer takeaway</h2>
          <p className="mt-3 text-sm leading-7 text-[#374151]">{page.retailerTakeaway}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <CTABlock
          heading="Ready to upgrade your chew section?"
          subheading="Apply for wholesale pricing on yak cheese chews and see the margin difference for yourself."
          primary={page.cta.primary}
          secondary={page.cta.secondary}
          variant="green"
        />
      </section>

      {/* FAQ */}
      <section className="border-t border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-4xl px-6">
          <FAQAccordion faqs={page.faqs} />
        </div>
      </section>

      {/* Related Links */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <RelatedLinks links={page.relatedLinks} />
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Stock the chew your customers keep coming back for
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for wholesale pricing on Himalayan yak cheese chews today.
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
