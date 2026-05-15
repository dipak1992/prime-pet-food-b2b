import type { Metadata } from "next";
import Link from "next/link";
import { wholesaleIntentPages } from "@/content/seo/wholesaleIntentPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import BenefitGrid from "@/components/seo/BenefitGrid";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const page = wholesaleIntentPages.find((p) => p.slug === "wholesale-dog-chews-for-pet-stores")!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wholesale.theprimepetfood.com";

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

export default function WholesaleDogChewsForPetStoresPage() {
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
            { label: "Dog Chews for Pet Stores" },
          ]}
        />
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
            For Independent Pet Stores
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-4 text-base leading-7 text-[#4b5563] sm:text-lg">{page.subtitle}</p>
          <p className="mt-4 text-sm leading-7 text-[#4b5563]">{page.intro}</p>
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
      </section>

      {/* Margin highlight banner */}
      <section className="border-y border-[#e7e4dc] bg-[#fff7ed]">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:grid-cols-3">
          {[
            ["40–60%", "Gross margin at standard retail"],
            ["12+ months", "Shelf life — no refrigeration"],
            ["2–6 weeks", "Average customer reorder cycle"],
          ].map(([stat, label]) => (
            <div key={stat} className="text-center">
              <p className="text-3xl font-bold text-[#ea580c]">{stat}</p>
              <p className="mt-1 text-sm text-[#4b5563]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buyer Benefits */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="Why pet stores choose Prime Pet Food yak chews"
            subheading="High margin, strong repeat purchase, and a product story your staff can sell."
            benefits={page.buyerBenefits}
            columns={3}
          />
        </div>
      </section>

      {/* Product Benefits */}
      <section className="border-y border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="What makes yak chews a top-selling pet store product"
            benefits={page.productBenefits}
            columns={3}
            variant="green"
          />
        </div>
      </section>

      {/* Mid CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <CTABlock
          heading="Apply for pet store wholesale pricing"
          subheading="Join independent pet stores across the USA who trust Prime Pet Food for their natural chew section."
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
            Ready to upgrade your dog chew section?
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply today and get access to protected wholesale pricing, MOQ details, and the reorder portal.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f3f4f6]"
            >
              Apply for wholesale pricing
            </Link>
            <Link
              href="/dog-treat-profit-calculator"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              Calculate your margin
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
