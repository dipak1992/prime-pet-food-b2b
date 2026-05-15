import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import Link from "next/link";
import Image from "next/image";
import { wholesaleIntentPages } from "@/content/seo/wholesaleIntentPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import BenefitGrid from "@/components/seo/BenefitGrid";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const page = wholesaleIntentPages.find((p) => p.slug === "wholesale-yak-cheese-dog-chews")!;
const BASE_URL = SITE_URL;

export const metadata: Metadata = {
  title: page.seoTitle,
  description: page.metaDescription,
  alternates: { canonical: `${BASE_URL}/${page.slug}` },
  openGraph: {
    title: page.seoTitle,
    description: page.metaDescription,
    url: `${BASE_URL}/${page.slug}`,
    type: "website",
  },
};

export default function WholesaleYakCheeseDogChewsPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="Product"
        name={page.h1}
        description={page.metaDescription}
        url={`${BASE_URL}/${page.slug}`}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Wholesale", href: "/wholesale" },
            { label: "Yak Cheese Dog Chews" },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
              B2B Wholesale Program
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b5563] sm:text-lg">
              {page.subtitle}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">{page.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={page.cta.primary.href}
                className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
              >
                {page.cta.primary.label}
              </Link>
              {page.cta.secondary && (
                <Link
                  href={page.cta.secondary.href}
                  className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fcfbf9]"
                >
                  {page.cta.secondary.label}
                </Link>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e7e4dc] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <Image
                src="/logoedited.jpg"
                alt="Prime Pet Food logo"
                width={72}
                height={72}
                className="h-16 w-16 object-contain"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                  Wholesale access includes
                </p>
                <p className="mt-1 text-base font-semibold text-[#111827]">
                  Protected pricing, MOQ, case packs &amp; reorders
                </p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Review time", "1 business day"],
                ["Payment", "Invoice / ACH"],
                ["Catalog", "Gated by approval"],
                ["Ordering", "Case-pack portal"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                  <dt className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-[#111827]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Buyer Benefits */}
      <section className="border-y border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="Why wholesale buyers choose Prime Pet Food"
            subheading="Everything your B2B buying program needs — from protected pricing to fast reorders."
            benefits={page.buyerBenefits}
            columns={3}
          />
        </div>
      </section>

      {/* Product Benefits */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="Why Himalayan yak cheese chews sell"
            subheading="Natural, long-lasting, and high-margin — the product your customers keep coming back for."
            benefits={page.productBenefits}
            columns={3}
            variant="green"
          />
        </div>
      </section>

      {/* Mid-page CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <CTABlock
          heading="Ready to stock yak cheese chews at wholesale pricing?"
          subheading="Apply for a wholesale account today. Most applications are reviewed within 1 business day."
          primary={page.cta.primary}
          secondary={page.cta.secondary}
          variant="green"
        />
      </section>

      {/* FAQ */}
      <section className="border-t border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <FAQAccordion faqs={page.faqs} />
        </div>
      </section>

      {/* Related Links */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <RelatedLinks links={page.relatedLinks} />
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Start your wholesale account today
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Join hundreds of pet stores, groomers, and daycares who trust Prime Pet Food for wholesale yak cheese chews.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f3f4f6]"
            >
              Apply for wholesale pricing
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              Preview catalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
