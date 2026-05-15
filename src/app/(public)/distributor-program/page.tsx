import type { Metadata } from "next";
import Link from "next/link";
import { distributorPages } from "@/content/seo/distributorPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import BenefitGrid from "@/components/seo/BenefitGrid";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const page = distributorPages.find((p) => p.slug === "distributor-program")!;
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

export default function DistributorProgramPage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="WebPage"
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
            { label: "Distributor Program" },
          ]}
        />
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
            Distributor &amp; High-Volume Partners
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

      {/* Ideal For */}
      <section className="border-y border-[#e7e4dc] bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-xl font-semibold text-[#111827]">Who this program is for</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {page.idealFor.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] px-4 py-3 text-sm font-medium text-[#374151]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Program Features */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <BenefitGrid
            heading="Distributor program features"
            subheading="Everything you need to add Prime Pet Food yak chews to your portfolio."
            benefits={page.programFeatures}
            columns={3}
          />
        </div>
      </section>

      {/* Process Steps */}
      <section className="border-y border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-[#111827]">
            How to become a distributor
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {page.processSteps.map((step) => (
              <div key={step.step} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-[#ea580c]">
                  Step {step.step}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#111827]">{step.title}</p>
                <p className="mt-2 text-xs leading-5 text-[#6b7280]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <CTABlock
          heading="Ready to add yak chews to your distribution portfolio?"
          subheading="Apply today and our team will reach out to discuss your territory, volume, and pricing structure."
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
            Become a Prime Pet Food distributor
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for a distributor account and start adding premium yak cheese chews to your portfolio.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f3f4f6]"
            >
              Apply for distributor account
            </Link>
            <Link
              href="/private-label-yak-chews"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              Explore private label
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
