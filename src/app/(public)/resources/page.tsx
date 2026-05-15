import type { Metadata } from "next";
import Link from "next/link";
import {
  blogArticles,
  formatArticleDate,
  categoryColors,
  type BlogArticle,
} from "@/content/seo/blogArticles";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wholesale.theprimepetfood.com";

export const metadata: Metadata = {
  title: "Wholesale Resources & Retailer Guides | Prime Pet Food Blog",
  description:
    "B2B wholesale guides, retailer tips, product education, and industry insights for pet store owners, groomers, and wholesale buyers from Prime Pet Food.",
  alternates: { canonical: `${BASE_URL}/resources` },
  openGraph: {
    title: "Wholesale Resources & Retailer Guides | Prime Pet Food",
    description:
      "B2B wholesale guides, retailer tips, and product education for pet store owners and wholesale buyers.",
    url: `${BASE_URL}/resources`,
    type: "website",
  },
};

const categories: { value: BlogArticle["category"] | "all"; label: string }[] = [
  { value: "all", label: "All Articles" },
  { value: "wholesale-tips", label: "Wholesale Tips" },
  { value: "product-education", label: "Product Education" },
  { value: "retailer-guide", label: "Retailer Guides" },
  { value: "industry-news", label: "Industry News" },
];

function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-[#e7e4dc] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[article.category]}`}
          >
            {article.categoryLabel}
          </span>
          <span className="text-xs text-[#9ca3af]">{article.readTime}</span>
        </div>
        <h2 className="mt-3 text-base font-semibold leading-snug text-[#111827] group-hover:text-[#ea580c]">
          <Link href={`/resources/${article.slug}`}>{article.h1}</Link>
        </h2>
        <p className="mt-2 flex-1 text-sm leading-6 text-[#4b5563]">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-[#9ca3af]">{formatArticleDate(article.publishedAt)}</span>
          <Link
            href={`/resources/${article.slug}`}
            className="text-xs font-semibold text-[#ea580c] hover:underline"
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ResourcesIndexPage() {
  const sorted = [...blogArticles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="WebPage"
        name="Wholesale Resources & Retailer Guides"
        description="B2B wholesale guides, retailer tips, and product education for pet store owners and wholesale buyers."
        url={`${BASE_URL}/resources`}
      />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Wholesale", href: "/wholesale" },
            { label: "Resources" },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ea580c]">
          B2B Wholesale Resources
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Retailer Guides &amp; Wholesale Resources
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#4b5563]">
          Practical guides for pet store owners, groomers, and wholesale buyers — margin strategies, product education, merchandising tips, and industry insights.
        </p>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="border-y border-[#e7e4dc] bg-white py-10">
          <div className="mx-auto max-w-6xl px-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
              Featured article
            </p>
            <Link
              href={`/resources/${featured.slug}`}
              className="group grid gap-6 lg:grid-cols-[1.5fr_1fr]"
            >
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[featured.category]}`}
                >
                  {featured.categoryLabel}
                </span>
                <h2 className="mt-3 text-2xl font-semibold leading-snug text-[#111827] group-hover:text-[#ea580c] sm:text-3xl">
                  {featured.h1}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#4b5563]">{featured.excerpt}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-xs text-[#9ca3af]">{formatArticleDate(featured.publishedAt)}</span>
                  <span className="text-xs text-[#9ca3af]">{featured.readTime}</span>
                  <span className="text-sm font-semibold text-[#ea580c] group-hover:underline">
                    Read article →
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-2xl border border-[#e7e4dc] bg-[#fff7ed] p-8">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#ea580c]">B2B</p>
                  <p className="mt-2 text-sm font-medium text-[#374151]">Wholesale Guide</p>
                  <p className="mt-1 text-xs text-[#6b7280]">Prime Pet Food</p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter + Article Grid */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Category pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat.value}
              className="rounded-xl border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-medium text-[#374151]"
            >
              {cat.label}
            </span>
          ))}
        </div>

        {/* Article grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Ready to stock the highest-margin dog chew?
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Apply for wholesale pricing on Himalayan yak cheese chews and start earning better margin.
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
