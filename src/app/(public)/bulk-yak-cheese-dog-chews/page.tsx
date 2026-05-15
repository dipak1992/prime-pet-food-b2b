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

const page = wholesaleIntentPages.find((p) => p.slug === "bulk-yak-cheese-dog-chews")!;
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

export default function BulkYakCheeseDogChewsPage() {
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
            { label: "Bulk Yak Cheese Dog Chews" },
          ]}
        />
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
              Bulk &amp; High-Volume Wholesale
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
            <Image
              src="/logoedited.jpg"
              alt="Prime Pet Food logo"
              width={64}
              height={64}
              className="mb-4 h-14 w-14 object-contain"
            />
            <p className="text-sm font-semibold text-[#111827]">Bulk program highlights</p>
            <ul className="mt-3 space-y-2 text-sm text-[#4b5563]">
              {[
                "Volume-tiered pricing",
                "Custom case configurations",
                "Dedicated account manager",
                "Net-30 terms for established accounts",
                "Consistent supply chain",
                "Drop-ship options available",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#ea580c]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Buyer Benefits */}
      <section className="border-y border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="Bulk wholesale program benefits"
            subheading="Built for distributors, multi-location chains, and high-volume buyers."
            benefits={page.buyerBenefits}
            columns={3}
          />
        </div>
      </section>

      {/* Product Benefits */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="Product quality at every volume"
            subheading="The same quality standards whether you order one case or one pallet."
            benefits={page.productBenefits}
            columns={3}
            variant="green"
          />
        </div>
      </section>

      {/* Mid CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <CTABlock
          heading="Ready to discuss bulk pricing?"
          subheading="Apply for a wholesale account and our team will reach out to discuss your volume and pricing structure."
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
            Request bulk pricing for your business
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Tell us your volume and we will build a custom pricing structure for your account.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f3f4f6]"
            >
              Apply for bulk pricing
            </Link>
            <Link
              href="/distributor-program"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              View distributor program
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
