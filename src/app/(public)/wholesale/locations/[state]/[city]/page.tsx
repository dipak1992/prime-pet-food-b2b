import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { notFound } from "next/navigation";
import Link from "next/link";
import { stateData } from "@/content/seo/locationPages";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import CTABlock from "@/components/seo/CTABlock";
import FAQAccordion from "@/components/seo/FAQAccordion";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const BASE_URL = SITE_URL;

// City slug → display name mapping per state
const cityMap: Record<string, Record<string, { name: string; note: string }>> = {
  texas: {
    dallas: {
      name: "Dallas",
      note: "Dallas–Fort Worth is one of the fastest-growing pet markets in the United States. With a booming population of dog owners and a strong independent pet retail scene, DFW pet businesses need reliable wholesale suppliers for premium natural products.",
    },
    houston: {
      name: "Houston",
      note: "Houston is the largest city in Texas and home to a diverse, rapidly growing pet owner population. Independent pet stores and grooming salons in Houston consistently report strong demand for natural, premium dog treats.",
    },
    austin: {
      name: "Austin",
      note: "Austin's health-conscious, premium-oriented consumer base makes it one of the strongest markets in Texas for natural pet products. Independent pet stores in Austin are early adopters of clean-label dog treats.",
    },
    "san-antonio": {
      name: "San Antonio",
      note: "San Antonio's large and growing population of dog owners drives consistent demand for premium pet products. Independent pet stores and groomers in San Antonio benefit from strong repeat purchase on natural chews.",
    },
  },
  california: {
    "los-angeles": {
      name: "Los Angeles",
      note: "Los Angeles pet owners are among the most health-conscious in the country. The LA market has a strong appetite for natural, clean-label pet products, and independent pet stores consistently outperform on premium chew categories.",
    },
    "san-francisco": {
      name: "San Francisco",
      note: "San Francisco's premium-oriented, health-conscious pet owners drive strong demand for natural dog treats. The Bay Area independent pet retail scene is one of the most sophisticated in the country.",
    },
    "san-diego": {
      name: "San Diego",
      note: "San Diego's active outdoor lifestyle and health-conscious culture extends to pet ownership. Natural dog chews are a strong category in San Diego's independent pet stores.",
    },
  },
  "new-york": {
    "new-york-city": {
      name: "New York City",
      note: "New York City's dense urban pet market and premium-oriented consumers make it one of the strongest markets in the country for natural dog chews. Independent pet boutiques in NYC command premium retail prices.",
    },
  },
};

interface Props {
  params: Promise<{ state: string; city: string }>;
}

export async function generateStaticParams() {
  const params: { state: string; city: string }[] = [];
  for (const [stateSlug, cities] of Object.entries(cityMap)) {
    for (const citySlug of Object.keys(cities)) {
      params.push({ state: stateSlug, city: citySlug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const state = stateData.find((s) => s.slug === stateSlug);
  const city = cityMap[stateSlug]?.[citySlug];
  if (!state || !city) return {};
  return {
    title: `Wholesale Yak Cheese Dog Chews in ${city.name}, ${state.code} | Prime Pet Food`,
    description: `Wholesale Himalayan yak cheese dog chews for ${city.name} pet stores, groomers, and daycares. Protected pricing, fast shipping to ${city.name}. Apply today.`,
    alternates: { canonical: `${BASE_URL}/wholesale/locations/${stateSlug}/${citySlug}` },
    openGraph: {
      title: `Wholesale Yak Cheese Dog Chews in ${city.name}, ${state.code}`,
      description: `Wholesale Himalayan yak cheese dog chews for ${city.name} pet retailers. Apply for wholesale pricing today.`,
      url: `${BASE_URL}/wholesale/locations/${stateSlug}/${citySlug}`,
      type: "website",
    },
  };
}

export default async function CityLocationPage({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params;
  const state = stateData.find((s) => s.slug === stateSlug);
  const city = cityMap[stateSlug]?.[citySlug];
  if (!state || !city) notFound();

  const faqs = [
    {
      question: `Do you supply wholesale dog chews to ${city.name} pet stores?`,
      answer: `Yes. We supply approved wholesale accounts across ${city.name} and the surrounding area. Apply for a wholesale account to get started.`,
    },
    {
      question: `How fast does wholesale shipping arrive in ${city.name}?`,
      answer: `${city.name}-area orders typically arrive in ${state.shippingDays} from our distribution center.`,
    },
    {
      question: `Can ${city.name} groomers and daycares get wholesale pricing?`,
      answer: `Yes. Groomers, dog daycares, and boarding facilities in ${city.name} qualify for wholesale pricing. Apply with your business details and we will review within 1 business day.`,
    },
    {
      question: `What is the minimum order for ${city.name} wholesale buyers?`,
      answer: `Minimum order quantities are displayed per SKU in the wholesale catalog after approval. Most ${city.name} buyers start with a mixed case to test sell-through before committing to larger quantities.`,
    },
  ];

  const relatedLinks = [
    { label: `Wholesale Dog Chews — ${state.name}`, href: `/wholesale/locations/${stateSlug}` },
    { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews" },
    { label: "Best High-Margin Dog Treats for Pet Stores", href: "/best-high-margin-dog-treats-for-pet-stores" },
    { label: "Apply for Wholesale Account", href: "/apply" },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="WebPage"
        name={`Wholesale Yak Cheese Dog Chews in ${city.name}, ${state.code}`}
        description={`Wholesale Himalayan yak cheese dog chews for ${city.name} pet retailers.`}
        url={`${BASE_URL}/wholesale/locations/${stateSlug}/${citySlug}`}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Wholesale Locations", href: "/wholesale/locations" },
            { label: state.name, href: `/wholesale/locations/${stateSlug}` },
            { label: city.name },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
          Wholesale — {city.name}, {state.code}
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Wholesale Yak Cheese Dog Chews — {city.name}, {state.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b5563] sm:text-lg">
          Supplying {city.name} pet retailers and groomers with premium wholesale natural dog chews.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">{city.note}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
          >
            Apply for {city.name} wholesale pricing
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
          {[
            ["Shipping to " + city.name, state.shippingDays, "Standard wholesale orders"],
            ["Review time", "1 business day", "Most applications"],
            ["Payment", "Invoice / ACH", "Preferred for approved accounts"],
          ].map(([label, value, sub]) => (
            <div key={label} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">{label}</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">{value}</p>
              <p className="mt-1 text-xs text-[#6b7280]">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who We Serve */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-4 text-xl font-semibold text-[#111827]">
          Who we supply in {city.name}
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
              className="rounded-xl border border-[#e7e4dc] bg-white px-4 py-3 text-sm font-medium text-[#374151]"
            >
              {type}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <CTABlock
          heading={`Apply for wholesale pricing in ${city.name}`}
          subheading={`Join pet businesses across ${city.name} who trust Prime Pet Food for wholesale yak cheese dog chews.`}
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
            Start your {city.name} wholesale account today
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
