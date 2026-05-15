import Image from "next/image";
import Link from "next/link";
import { getFeaturedArticles, formatArticleDate, categoryColors } from "@/content/seo/blogArticles";

export const metadata = {
  title: "Wholesale Program | Prime Pet Food",
  description:
    "Wholesale Himalayan Yak Cheese chews for pet stores, groomers, daycare, vet clinics, boutiques, and distributors.",
};

const buyerTypes = [
  "Independent pet stores",
  "Groomers and salons",
  "Dog daycare and boarding",
  "Veterinary clinics",
  "Boutique pet shops",
  "Regional distributors",
];

const economics = [
  ["Protected pricing", "Wholesale pricing is visible only after approval so retail partners can preserve margin."],
  ["Case-pack ordering", "Each SKU shows MOQ and case-pack rules before you submit an order request."],
  ["Invoice workflow", "Submit the order online; our team confirms availability and follows up with invoice details."],
  ["Reorder speed", "Approved buyers can reorder from order history and keep fast-moving chews in stock."],
];

const featuredArticles = getFeaturedArticles(3);

export default function WholesalePage() {
  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
        <div>
          <Link href="/" className="text-sm font-semibold text-[#ea580c]">
            Prime Pet Food
          </Link>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Wholesale yak cheese chews for retailers that need margin, clarity, and fast reorders.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#4b5563] sm:text-lg">
            Prime Pet Food gives approved B2B buyers a protected wholesale catalog with case-pack rules,
            MSRP guidance, invoice-based ordering, and a portal designed for repeat replenishment.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
            >
              Apply for wholesale pricing
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fcfbf9]"
            >
              Preview catalog
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e7e4dc] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Image
              src="/logoedited.jpg"
              alt="Prime Pet Food logo"
              width={88}
              height={88}
              className="h-20 w-20 object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Wholesale access includes
              </p>
              <p className="mt-1 text-lg font-semibold text-[#111827]">Pricing, MOQ, case packs, invoices, and reorders</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Review time", "Usually 1 business day"],
              ["Payment", "Invoice / ACH preferred"],
              ["Catalog", "Pricing gated by approval"],
              ["Ordering", "Case-pack aware cart"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
                <dt className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-[#111827]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Who this is for */}
      <section className="border-y border-[#e7e4dc] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Who this is for</h2>
            <p className="mt-3 text-sm leading-6 text-[#4b5563]">
              The program is built for businesses buying inventory for resale or customer-facing service counters.
            </p>
          </div>
          <ul className="grid gap-2 text-sm text-[#374151] sm:grid-cols-2 lg:col-span-2">
            {buyerTypes.map((type) => (
              <li key={type} className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] px-3 py-2 font-medium">
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Economics + How it works */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-4">
          {economics.map(([title, description]) => (
            <article key={title} className="rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#ea580c]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#4b5563]">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-[#ea580c]/20 bg-[#fff7ed] p-6">
          <h2 className="text-xl font-semibold">How ordering works</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ["1", "Apply with business details"],
              ["2", "Get approved for gated pricing"],
              ["3", "Build a case-pack order"],
              ["4", "Receive invoice and fulfillment updates"],
            ].map(([step, label]) => (
              <div key={step} className="rounded-xl bg-white p-4">
                <p className="text-xs font-bold text-[#ea580c]">Step {step}</p>
                <p className="mt-2 text-sm font-medium text-[#111827]">{label}</p>
              </div>
            ))}
          </div>
          <Link
            href="/apply"
            className="mt-6 inline-flex rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
          >
            Start wholesale application
          </Link>
        </div>
      </section>

      {/* Quick Links to SEO pages */}
      <section className="border-t border-[#e7e4dc] bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-5 text-xl font-semibold text-[#111827]">Explore the wholesale program</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Wholesale Yak Cheese Dog Chews", href: "/wholesale-yak-cheese-dog-chews", desc: "Protected pricing, MOQ, and case-pack ordering" },
              { label: "Bulk Yak Cheese Dog Chews", href: "/bulk-yak-cheese-dog-chews", desc: "Volume pricing for distributors and high-volume buyers" },
              { label: "Distributor Program", href: "/distributor-program", desc: "Partner with us to distribute in your region" },
              { label: "Private Label Yak Chews", href: "/private-label-yak-chews", desc: "Launch your own branded yak chew line" },
              { label: "Wholesale Dog Chews for Pet Stores", href: "/wholesale-dog-chews-for-pet-stores", desc: "40–60% gross margin for independent pet stores" },
              { label: "Yak Chews vs Rawhide", href: "/yak-chews-vs-rawhide-for-retailers", desc: "Side-by-side comparison for retail buyers" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-4 hover:border-[#ea580c]/30 hover:bg-[#fff7ed]"
              >
                <p className="text-sm font-semibold text-[#111827] group-hover:text-[#ea580c]">
                  {item.label} →
                </p>
                <p className="mt-1 text-xs text-[#6b7280]">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Resources Section */}
      <section className="border-t border-[#e7e4dc] bg-[#f8f7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
                Retailer Resources
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#111827]">
                Guides &amp; articles for wholesale buyers
              </h2>
              <p className="mt-2 text-sm text-[#4b5563]">
                Practical advice on margin, merchandising, and growing your dog treat section.
              </p>
            </div>
            <Link
              href="/resources"
              className="hidden shrink-0 text-sm font-semibold text-[#ea580c] hover:underline sm:block"
            >
              View all articles →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <article
                key={article.slug}
                className="group flex flex-col rounded-2xl border border-[#e7e4dc] bg-white p-5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColors[article.category]}`}
                  >
                    {article.categoryLabel}
                  </span>
                  <span className="text-xs text-[#9ca3af]">{article.readTime}</span>
                </div>
                <h3 className="mt-3 flex-1 text-sm font-semibold leading-snug text-[#111827] group-hover:text-[#ea580c]">
                  <Link href={`/resources/${article.slug}`}>{article.h1}</Link>
                </h3>
                <p className="mt-2 text-xs leading-5 text-[#6b7280] line-clamp-2">{article.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af]">{formatArticleDate(article.publishedAt)}</span>
                  <Link
                    href={`/resources/${article.slug}`}
                    className="text-xs font-semibold text-[#ea580c] hover:underline"
                  >
                    Read →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/resources"
              className="inline-flex items-center text-sm font-semibold text-[#ea580c] hover:underline"
            >
              View all articles →
            </Link>
          </div>
        </div>
      </section>

      {/* Profit Calculator CTA */}
      <section className="border-t border-[#e7e4dc] bg-white py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-2xl border border-[#ea580c]/20 bg-[#fff7ed] p-6 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ea580c]">
                Free Tool
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#111827]">
                Dog Treat Profit Calculator
              </h2>
              <p className="mt-2 text-sm text-[#4b5563]">
                See your exact gross margin on yak chews before you place a wholesale order.
              </p>
            </div>
            <div className="mt-4 shrink-0 sm:mt-0 sm:ml-6">
              <Link
                href="/dog-treat-profit-calculator"
                className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c2410c]"
              >
                Calculate your margin →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
