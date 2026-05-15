import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  blogArticles,
  formatArticleDate,
  categoryColors,
  getFeaturedArticles,
} from "@/content/seo/blogArticles";
import BreadcrumbNav from "@/components/seo/BreadcrumbNav";
import FAQAccordion from "@/components/seo/FAQAccordion";
import CTABlock from "@/components/seo/CTABlock";
import RelatedLinks from "@/components/seo/RelatedLinks";
import SchemaMarkup from "@/components/seo/SchemaMarkup";

const BASE_URL = SITE_URL;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.seoTitle,
    description: article.metaDescription,
    alternates: { canonical: `${BASE_URL}/resources/${article.slug}` },
    openGraph: {
      title: article.seoTitle,
      description: article.metaDescription,
      url: `${BASE_URL}/resources/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = blogArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  // Related articles: same category, excluding current
  const related = getFeaturedArticles(6)
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#111827]">
      <SchemaMarkup
        type="Article"
        headline={article.h1}
        description={article.metaDescription}
        url={`${BASE_URL}/resources/${article.slug}`}
        datePublished={article.publishedAt}
      />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <BreadcrumbNav
          items={[
            { label: "Prime Pet Food", href: "/" },
            { label: "Resources", href: "/resources" },
            { label: article.categoryLabel, href: "/resources" },
          ]}
        />
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${categoryColors[article.category]}`}
          >
            {article.categoryLabel}
          </span>
          <span className="text-xs text-[#9ca3af]">{article.readTime}</span>
          <span className="text-xs text-[#9ca3af]">{formatArticleDate(article.publishedAt)}</span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          {article.h1}
        </h1>
        <p className="mt-4 text-base leading-7 text-[#4b5563] sm:text-lg">{article.excerpt}</p>
      </section>

      {/* Key Takeaways */}
      {article.keyTakeaways && article.keyTakeaways.length > 0 && (
        <section className="border-y border-[#e7e4dc] bg-white py-8">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
              Key takeaways
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {article.keyTakeaways.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] px-4 py-3 text-sm text-[#374151]"
                >
                  <span className="mt-0.5 shrink-0 text-[#ea580c]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Article Body */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-10">
          {article.sections.map((section, index) => (
            <article key={index}>
              <h2 className="text-xl font-semibold text-[#111827]">{section.heading}</h2>
              <p className="mt-3 text-sm leading-7 text-[#4b5563]">{section.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Tags */}
      {article.tags.length > 0 && (
        <section className="mx-auto max-w-4xl px-6 pb-8">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#e7e4dc] bg-white px-3 py-1 text-xs font-medium text-[#6b7280]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Mid CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-12">
        <CTABlock
          heading="Ready to apply what you just learned?"
          subheading="Apply for wholesale pricing on Himalayan yak cheese chews and start earning better margin."
          primary={article.cta.primary}
          secondary={article.cta.secondary}
          variant="green"
        />
      </section>

      {/* FAQ */}
      {article.faqs && article.faqs.length > 0 && (
        <section className="border-t border-[#e7e4dc] bg-white py-12">
          <div className="mx-auto max-w-4xl px-6">
            <FAQAccordion faqs={article.faqs} />
          </div>
        </section>
      )}

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="border-t border-[#e7e4dc] bg-[#f8f7f4] py-12">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-6 text-xl font-semibold text-[#111827]">More wholesale resources</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/resources/${rel.slug}`}
                  className="group rounded-2xl border border-[#e7e4dc] bg-white p-5 hover:border-[#ea580c]/30 hover:bg-[#fff7ed]"
                >
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColors[rel.category]}`}
                  >
                    {rel.categoryLabel}
                  </span>
                  <p className="mt-2 text-sm font-semibold leading-snug text-[#111827] group-hover:text-[#ea580c]">
                    {rel.h1}
                  </p>
                  <p className="mt-1 text-xs text-[#9ca3af]">{rel.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related Links */}
      <section className="mx-auto max-w-4xl px-6 py-10">
        <RelatedLinks links={article.relatedLinks} />
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[#e7e4dc] bg-[#111827] py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Apply for wholesale pricing today
          </h2>
          <p className="mt-3 text-sm text-[#9ca3af]">
            Join pet stores, groomers, and daycares across the USA who trust Prime Pet Food for wholesale yak cheese chews.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111827] hover:bg-[#f3f4f6]"
            >
              Apply for wholesale pricing
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
            >
              More resources
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
