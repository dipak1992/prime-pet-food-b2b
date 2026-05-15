import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { wholesaleIntentPages } from "@/content/seo/wholesaleIntentPages";
import { retailerGuides } from "@/content/seo/retailerGuides";
import { comparisonPages } from "@/content/seo/comparisonPages";
import { distributorPages } from "@/content/seo/distributorPages";
import { stateData } from "@/content/seo/locationPages";
import { blogArticles } from "@/content/seo/blogArticles";

const BASE_URL = SITE_URL;

// City slug map (mirrors the city-level page)
const cityMap: Record<string, string[]> = {
  texas: ["dallas", "houston", "austin", "san-antonio"],
  california: ["los-angeles", "san-francisco", "san-diego"],
  "new-york": ["new-york-city"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static public SEO pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/wholesale`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/apply`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE_URL}/catalog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/dog-treat-profit-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/wholesale/locations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  // Wholesale intent pages
  const intentPages: MetadataRoute.Sitemap = wholesaleIntentPages.map((p) => ({
    url: `${BASE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  // Retailer guides
  const guidePages: MetadataRoute.Sitemap = retailerGuides.map((p) => ({
    url: `${BASE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Comparison pages
  const compPages: MetadataRoute.Sitemap = comparisonPages.map((p) => ({
    url: `${BASE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Distributor pages
  const distPages: MetadataRoute.Sitemap = distributorPages.map((p) => ({
    url: `${BASE_URL}/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  // State location pages
  const statePages: MetadataRoute.Sitemap = stateData.map((s) => ({
    url: `${BASE_URL}/wholesale/locations/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  // City location pages
  const cityPages: MetadataRoute.Sitemap = Object.entries(cityMap).flatMap(
    ([stateSlug, cities]) =>
      cities.map((citySlug) => ({
        url: `${BASE_URL}/wholesale/locations/${stateSlug}/${citySlug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
  );

  // Blog article pages
  const blogPages: MetadataRoute.Sitemap = blogArticles.map((article) => ({
    url: `${BASE_URL}/resources/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...staticPages,
    ...intentPages,
    ...guidePages,
    ...compPages,
    ...distPages,
    ...statePages,
    ...cityPages,
    ...blogPages,
  ];
}
