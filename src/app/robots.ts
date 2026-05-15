import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://wholesale.theprimepetfood.com";

  return {
    rules: [
      {
        // Allow crawling of all public SEO pages
        userAgent: "*",
        allow: [
          "/wholesale",
          "/wholesale-yak-cheese-dog-chews",
          "/bulk-yak-cheese-dog-chews",
          "/wholesale-dog-chews-for-pet-stores",
          "/yak-chews-vs-rawhide-for-retailers",
          "/best-high-margin-dog-treats-for-pet-stores",
          "/dog-treat-profit-calculator",
          "/distributor-program",
          "/private-label-yak-chews",
          "/wholesale/locations",
          "/apply",
          "/catalog",
        ],
        // Block authenticated/private portal routes
        disallow: [
          "/dashboard",
          "/orders",
          "/invoices",
          "/account",
          "/cart",
          "/checkout",
          "/admin",
          "/api",
          "/auth",
          "/downloads",
          "/favorites",
          "/bundles",
          "/quick-order",
          "/quote",
          "/support",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
