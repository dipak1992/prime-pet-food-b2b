import type { Metadata } from "next";
import Link from "next/link";
import { retailerGuides } from "@/content/seo/retailerGuides";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const page = retailerGuides.find((p) => p.slug === "best-high-margin-dog-treats-for-pet-stores")!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wholesale.theprimepetfood.com";

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

export default function BestHighMarginDogTreatsPage() {
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
            { label: "Retailer Guides", href: "/wholesale" },
            { label: "High-Margin Dog Treats" },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1d4b43]">
          Retailer Education
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {page.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4b5563] sm:text-lg">{page.subtitle}</p>
        <p className="mt-4 text-sm leading-7 text-[#4b5563]">{page.intro}</p>
      </section>

      {/* Key Takeaways */}
      <section className="border-y border-[#e7e4dc] bg-white py-10">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-4 text-lg font-semibold text-[#111827]">Key takeaways</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {page.keyTakeaways.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] px-4 py-3 text-sm text-[#374151]"
              >
                <span className="mt-0.5 shrink-0 text-[#1d4b43]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Article Sections */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-10">
          {page.sections.map((section, index) => (
            <article key={index}>
              <h2 className="text-xl font-semibold text-[#111827]">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-[#4b5563]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Mid CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <CTABlock
          heading="Ready to stock the highest-margin dog chew?"
          subheading="Apply for wholesale pricing on Himalayan yak cheese chews and see the margin difference."
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
            Start earning better margin on dog treats
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for wholesale pricing on yak cheese chews — the highest-margin natural chew for independent pet stores.
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
