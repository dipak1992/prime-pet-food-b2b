import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { stateData } from "@/content/seo/locationPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wholesale.theprimepetfood.com";

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  return stateData.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = stateData.find((s) => s.slug === stateSlug);
  if (!state) return {};
  return {
    title: `Wholesale Yak Cheese Dog Chews in ${state.name} | Prime Pet Food`,
    description: `Supply your ${state.name} pet store, groomer, or daycare with wholesale Himalayan yak cheese dog chews. Fast shipping across ${state.name}. Apply for wholesale pricing today.`,
    alternates: { canonical: `${BASE_URL}/wholesale/locations/${state.slug}` },
    openGraph: {
      title: `Wholesale Yak Cheese Dog Chews in ${state.name}`,
      description: `Wholesale Himalayan yak cheese dog chews for ${state.name} pet retailers. Protected pricing, fast shipping. Apply today.`,
      url: `${BASE_URL}/wholesale/locations/${state.slug}`,
      type: "website",
    },
  };
}

export default async function StateLocationPage({ params }: Props) {
  const { state: stateSlug } = await params;
  const state = stateData.find((s) => s.slug === stateSlug);
  if (!state) notFound();

  const faqs = [
    {
      question: `Do you ship wholesale yak chews to ${state.name}?`,
      answer: `Yes. We ship to all ${state.name} zip codes. Standard wholesale orders typically arrive in ${state.shippingDays}.`,
    },
    {
      question: `Can ${state.name} pet stores apply for wholesale pricing?`,
      answer: `Yes. Any ${state.name}-based pet store, groomer, daycare, boarding facility, or vet clinic can apply for a wholesale account. Most applications are reviewed within 1 business day.`,
    },
    {
      question: `Are there ${state.name} distributors for Prime Pet Food yak chews?`,
      answer: `We work with select distributors in ${state.name}. If you are a distributor interested in carrying our products, please apply through our distributor program page.`,
    },
    {
      question: `What is the minimum order for ${state.name} wholesale buyers?`,
      answer: `Minimum order quantities are displayed per SKU in the wholesale catalog after approval. Most ${state.name} buyers start with a mixed case to test sell-through.`,
    },
  ];

  const relatedLinks = [
    { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
    { label: "Distributor Program", href: "/distributor-program" },
    { label: "Best High-Margin Dog Treats for Pet Stores", href: "/best-high-margin-dog-treats-for-pet-stores" },
    { label: "Apply for Wholesale Account", href: "/apply" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="WebPage"
        name={`Wholesale Yak Cheese Dog Chews in ${state.name}`}
        description={`Wholesale Himalayan yak cheese dog chews for ${state.name} pet retailers.`}
        url={`${BASE_URL}/wholesale/locations/${state.slug}`}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Wholesale Locations", href: "/wholesale/locations" },
            { label: state.name },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
          Wholesale — {state.name}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Wholesale Yak Cheese Dog Chews — {state.name} Pet Retailers
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b5563] sm:text-lg">
          Serving pet stores, groomers, boarding facilities, and distributors across {state.name} with wholesale natural dog chews.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">{state.marketNote}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
          >
            Apply for {state.name} wholesale pricing
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fcfbf9]"
          >
            Preview catalog
          </Link>
        </div>
      </section>

      {/* Shipping + Stats */}
      <section className="border-y border-[#e7e4dc] bg-white py-10">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-3">
          <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Shipping to {state.name}
            </p>
            <p className="mt-2 text-lg font-semibold text-[#111827]">{state.shippingDays}</p>
            <p className="mt-1 text-xs text-[#6b7280]">Standard wholesale orders</p>
          </div>
          <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Review time
            </p>
            <p className="mt-2 text-lg font-semibold text-[#111827]">1 business day</p>
            <p className="mt-1 text-xs text-[#6b7280]">Most applications</p>
          </div>
          <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
              Payment
            </p>
            <p className="mt-2 text-lg font-semibold text-[#111827]">Invoice / ACH</p>
            <p className="mt-1 text-xs text-[#6b7280]">Preferred for approved accounts</p>
          </div>
        </div>
      </section>

      {/* Major Cities */}
      {state.majorCities.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="mb-4 text-xl font-semibold text-[#111827]">
            Serving pet businesses across {state.name}
          </h2>
          <div className="flex flex-wrap gap-2">
            {state.majorCities.map((city) => (
              <span
                key={city}
                className="rounded-xl border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-medium text-[#374151]"
              >
                {city}
              </span>
            ))}
            <span className="rounded-xl border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-medium text-[#374151]">
              + all {state.name} zip codes
            </span>
          </div>
        </section>
      )}

      {/* Who We Serve */}
      <section className="border-y border-[#e7e4dc] bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-xl font-semibold text-[#111827]">
            Who we supply in {state.name}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Independent pet stores",
              "Groomers and salons",
              "Dog daycare and boarding",
              "Veterinary clinics",
              "Boutique pet shops",
              "Regional distributors",
            ].map((type) => (
              <li
                key={type}
                className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] px-4 py-3 text-sm font-medium text-[#374151]"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <CTABlock
          heading={`Apply for wholesale pricing in ${state.name}`}
          subheading={`Join pet businesses across ${state.name} who trust Prime Pet Food for wholesale yak cheese dog chews.`}
          primary={{ label: "Apply for wholesale account", href: "/apply" }}
          secondary={{ label: "View wholesale program", href: "/wholesale-yak-cheese-dog-chews" }}
          variant="green"
        />
      </section>

      {/* FAQ */}
      <section className="border-t border-[#e7e4dc] bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <FAQAccordion faqs={faqs} />
        </div>
      </section>

      {/* Related Links */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <RelatedLinks links={relatedLinks} />
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Start your {state.name} wholesale account today
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for protected wholesale pricing on Himalayan yak cheese dog chews.
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
