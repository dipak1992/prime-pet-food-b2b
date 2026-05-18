import Link from "next/link";
import Image from "next/image";
import { getFeaturedArticles, formatArticleDate, categoryColors } from "@/content/seo/blogArticles";

const featuredArticles = getFeaturedArticles(3);

const proofPoints = [
  ["Retail margin story", "Show MSRP, wholesale cost, case economics, and gross profit before buyers commit."],
  ["Wholesale-first workflow", "Applications, protected pricing, PO-friendly checkout, invoices, and reorder tools are built around B2B buying."],
  ["Retailer enablement", "Approved buyers get sell sheets, shelf talker copy, brand assets, and practical merchandising guidance."],
];

const retailerProof = [
  ["Pet stores", "Natural chew assortment, shelf appeal, and clear margin math for repeat retail sales."],
  ["Groomers", "Counter-friendly premium chews customers can add after appointments."],
  ["Daycare & boarding", "Replenishment-friendly case packs for enrichment, retail add-ons, and take-home sales."],
  ["Vet clinics", "Simple ingredient positioning and education assets for staff-led recommendations."],
];

const wholesaleFaqs = [
  ["When do I see pricing?", "Wholesale pricing is visible after your business account is approved."],
  ["How quickly are applications reviewed?", "Most complete applications are reviewed within one business day."],
  ["How does payment work?", "Orders can be submitted online; invoice and ACH are preferred for approved accounts."],
  ["Can I request samples or volume pricing?", "Approved buyers can request samples, custom pricing, or sales help from the portal."],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,#f9f2df_0%,#f8f7f4_45%,#eef6f3_100%)]">
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Hero */}
        <div className="flex min-h-[60vh] flex-col justify-center">
          <Image
            src="/logoedited.jpg"
            alt="Prime Pet Food Logo"
            width={120}
            height={120}
            className="mb-6 h-24 w-24 object-contain"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#ea580c]">Prime Pet Food</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#111827] sm:text-5xl">
            Wholesale Himalayan Yak Chews built for retail margins.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[#4b5563] sm:text-lg">
            Stock natural, long-lasting dog chews with protected wholesale pricing, case-pack ordering, and a portal built for fast reorders.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-[#ea580c] px-5 py-3 text-sm font-semibold text-white"
            >
              Apply for wholesale
            </Link>
            <Link
              href="/wholesale"
              className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937]"
            >
              See wholesale program
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937]"
            >
              Browse catalog
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              ["Protected wholesale pricing", "Approved retailers see wholesale pricing, MSRP guidance, MOQ, and case-pack details."],
              ["Fast replenishment", "Reorder proven sellers from your order history with case-pack-aware quantities."],
              ["Retail-ready assortment", "Built for pet shops, groomers, daycare counters, vet clinics, and boutique shelves."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-[#e5e7eb] bg-white/90 p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-[#111827]">{title}</h2>
                <p className="mt-2 text-sm text-[#6b7280]">{description}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Why retailers section */}
        <div className="mt-12 rounded-3xl border border-[#e5e7eb] bg-white/95 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#111827]">Why retailers stock yak cheese chews</h2>
          <p className="mt-4 text-base text-[#4b5563] leading-relaxed max-w-3xl">
            Himalayan Yak Cheese chews are a simple, high-protein, long-lasting treat with strong shelf appeal and repeat-purchase potential. Approved buyers get case-pack ordering, invoice-based fulfillment, and merchandising assets for resale.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Simple ingredients", detail: "A straightforward natural chew story that is easy for staff to explain at the shelf." },
              { label: "Long-lasting value", detail: "A premium treat format that fits impulse buys, counter displays, and enrichment sections." },
              { label: "Clear case economics", detail: "Approved buyers see MOQ, case packs, MSRP, and wholesale unit pricing before ordering." },
              { label: "Invoice-first ordering", detail: "Submit order requests online; our team confirms availability and follows up with invoice details." },
            ].map(({ label, detail }) => (
              <div key={label} className="border-l-2 border-[#ea580c] pl-4">
                <p className="font-semibold text-[#ea580c]">{label}</p>
                <p className="mt-1 text-sm text-[#6b7280]">{detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-[#6b7280]">
            Apply for wholesale access to review pricing, build a case-pack order, and request support from the Prime Pet Food team.
          </p>
        </div>

        {/* Conversion proof */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">Wholesale proof</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Built for retailer confidence before the first order.</h2>
            <div className="mt-5 space-y-4">
              {proofPoints.map(([title, copy]) => (
                <div key={title} className="border-l-2 border-[#1d4b43] pl-4">
                  <p className="text-sm font-semibold text-[#111827]">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#6b7280]">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">Who it serves</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#111827]">One yak chew line, several B2B use cases.</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {retailerProof.map(([title, copy]) => (
                <div key={title} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-4">
                  <p className="text-sm font-semibold text-[#111827]">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#6b7280]">{copy}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">Buyer questions</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#111827]">Remove uncertainty before applying.</h2>
              <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                Wholesale buyers need clarity on pricing access, review time, payment, and sample support before they invest time in an application.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {wholesaleFaqs.map(([question, answer]) => (
                <div key={question} className="rounded-xl bg-[#fcfbf9] p-4">
                  <p className="text-sm font-semibold text-[#111827]">{question}</p>
                  <p className="mt-2 text-xs leading-5 text-[#6b7280]">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Blog / Resources Section */}
        <div className="mt-16">
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
                className="group flex flex-col rounded-2xl border border-[#e7e4dc] bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
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

        {/* Profit Calculator CTA */}
        <div className="mt-10 mb-16 rounded-2xl border border-[#ea580c]/20 bg-[#fff7ed] p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ea580c]">Free Tool</p>
            <h2 className="mt-1 text-xl font-semibold text-[#111827]">Dog Treat Profit Calculator</h2>
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
      </main>
    </div>
  );
}
