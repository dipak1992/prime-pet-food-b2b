import { prisma } from "@/lib/prisma";

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  bodyHtml?: string;
  images?: Array<{ src: string }>;
  variants?: Array<{
    id: string;
    sku: string;
    price: string;
    compare_at_price?: string;
  }>;
};

type ShopifyGraphQLResponse = {
  data?: {
    products?: {
      edges?: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
          bodyHtml?: string;
          images?: {
            edges?: Array<{ node: { src: string } }>;
          };
          variants?: {
            edges?: Array<{
              node: {
                id: string;
                sku: string;
                price: string;
                compareAtPrice?: string;
              };
            }>;
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
};

export class ProductSyncService {
  private storeDomain: string;
  private adminToken: string;
  private storefrontToken: string;

  constructor() {
    this.storeDomain = process.env.SHOPIFY_STORE_DOMAIN || "theprimepetfood.com";
    this.adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || "";
    this.storefrontToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
  }

  async fetchProducts(): Promise<ShopifyProduct[]> {
    if (!this.adminToken) {
      console.warn("SHOPIFY_ADMIN_ACCESS_TOKEN not set; returning empty product list.");
      return [];
    }

    const query = `
      {
        products(first: 250) {
          edges {
            node {
              id
              title
              handle
              bodyHtml
              images(first: 1) {
                edges {
                  node {
                    src
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    sku
                    price
                    compareAtPrice
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(`https://${this.storeDomain}/admin/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": this.adminToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        console.error("Shopify API error:", response.statusText);
        return [];
      }

      const data = (await response.json()) as ShopifyGraphQLResponse;

      if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        return [];
      }

      return (
        data.data?.products?.edges?.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          bodyHtml: edge.node.bodyHtml,
          images: edge.node.images?.edges?.map((img) => ({ src: img.node.src })),
          variants: edge.node.variants?.edges?.map((v) => ({
            id: v.node.id,
            sku: v.node.sku,
            price: v.node.price,
            compare_at_price: v.node.compareAtPrice,
          })),
        })) || []
      );
    } catch (error) {
      console.error("Error fetching Shopify products:", error);
      return [];
    }
  }

  async syncProducts(): Promise<{ recordsRead: number; recordsUpserted: number; error?: string }> {
    const jobId = await prisma.productSyncJob.create({
      data: {
        source: "SHOPIFY",
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    try {
      const products = await this.fetchProducts();

      if (!products.length) {
        await prisma.productSyncJob.update({
          where: { id: jobId.id },
          data: {
            status: "SUCCESS",
            finishedAt: new Date(),
            recordsRead: 0,
            recordsUpserted: 0,
          },
        });

        return { recordsRead: 0, recordsUpserted: 0 };
      }

      let recordsUpserted = 0;

      for (const product of products) {
        const variant = product.variants?.[0];

        if (!variant || !variant.sku) {
          continue;
        }

        const imageUrl = product.images?.[0]?.src || null;
        const msrp = variant.compare_at_price ? parseFloat(variant.compare_at_price) : null;
        const wholesalePrice = (parseFloat(variant.price) * 0.5).toFixed(2);

        await prisma.product.upsert({
          where: {
            retailSource_retailSourceId: {
              retailSource: "SHOPIFY",
              retailSourceId: product.id,
            },
          },
          create: {
            retailSource: "SHOPIFY",
            retailSourceId: product.id,
            handle: product.handle,
            title: product.title,
            description: product.bodyHtml || null,
            imageUrl,
            sku: variant.sku,
            category: "Pet Treats",
            msrp,
            wholesalePrice: parseFloat(wholesalePrice),
            moq: 1,
            casePack: 1,
            stockStatus: "IN_STOCK",
            isActive: true,
            syncedAt: new Date(),
          },
          update: {
            title: product.title,
            description: product.bodyHtml || null,
            imageUrl,
            sku: variant.sku,
            msrp,
            wholesalePrice: parseFloat(wholesalePrice),
            syncedAt: new Date(),
          },
        });

        recordsUpserted++;
      }

      await prisma.productSyncJob.update({
        where: { id: jobId.id },
        data: {
          status: "SUCCESS",
          finishedAt: new Date(),
          recordsRead: products.length,
          recordsUpserted,
        },
      });

      return { recordsRead: products.length, recordsUpserted };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await prisma.productSyncJob.update({
        where: { id: jobId.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          errorMessage,
        },
      });

      return { recordsRead: 0, recordsUpserted: 0, error: errorMessage };
    }
  }
}

export async function triggerProductSync() {
  const service = new ProductSyncService();
  return await service.syncProducts();
}
