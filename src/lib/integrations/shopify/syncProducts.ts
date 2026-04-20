import { prisma } from "@/lib/prisma";

type ShopifyVariantNode = {
  id: string;
  title: string;
  sku: string | null;
  price: string;
  compareAtPrice: string | null;
  inventoryQuantity: number | null;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  featuredImage: { url: string } | null;
  variants: { nodes: ShopifyVariantNode[] };
};

type SyncResult = {
  jobId: string;
  recordsRead: number;
  recordsUpserted: number;
  status: "SUCCESS" | "FAILED";
  message?: string;
};

const PRODUCT_SYNC_QUERY = `#graphql
  query ProductSyncQuery($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        handle
        description
        productType
        featuredImage {
          url
        }
        variants(first: 20) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
          }
        }
      }
    }
  }
`;

function toNumber(value: string | null | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function deriveWholesalePrice(msrp: number): number {
  return Number((msrp * 0.55).toFixed(2));
}

export async function syncProductsFromShopify(limit = 100): Promise<SyncResult> {
  // Read credentials from DB Setting table (set via OAuth), fall back to env vars
  const [domainSetting, tokenSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "shopify_store_domain" } }),
    prisma.setting.findUnique({ where: { key: "shopify_access_token" } }),
  ]);

  const storeDomain = domainSetting?.value || process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = tokenSetting?.value || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  if (!storeDomain || !accessToken) {
    throw new Error(
      "Shopify is not connected. Visit /admin/products and click 'Connect Shopify' to authorize."
    );
  }

  const job = await prisma.productSyncJob.create({
    data: {
      source: "SHOPIFY",
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    let hasNextPage = true;
    let after: string | null = null;
    let recordsRead = 0;
    let recordsUpserted = 0;

    while (hasNextPage && recordsRead < limit) {
      const response = await fetch(`https://${storeDomain}/admin/api/2024-10/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          query: PRODUCT_SYNC_QUERY,
          variables: {
            first: Math.min(25, limit - recordsRead),
            after,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Shopify sync failed with HTTP ${response.status}.`);
      }

      const payload = (await response.json()) as {
        data?: {
          products?: {
            pageInfo: { hasNextPage: boolean; endCursor: string | null };
            nodes: ShopifyProductNode[];
          };
        };
        errors?: Array<{ message: string }>;
      };

      if (payload.errors?.length) {
        throw new Error(payload.errors.map((entry) => entry.message).join("; "));
      }

      const products = payload.data?.products?.nodes ?? [];

      for (const product of products) {
        const variant = product.variants.nodes[0];
        if (!variant) {
          continue;
        }

        const msrp = toNumber(variant.compareAtPrice ?? variant.price, 0);
        const wholesalePrice = deriveWholesalePrice(msrp || toNumber(variant.price, 0));
        const inventory = variant.inventoryQuantity ?? 0;

        await prisma.product.upsert({
          where: {
            retailSource_retailSourceId: {
              retailSource: "SHOPIFY",
              retailSourceId: variant.id,
            },
          },
          create: {
            retailSource: "SHOPIFY",
            retailSourceId: variant.id,
            handle: product.handle,
            title: product.title,
            description: product.description,
            imageUrl: product.featuredImage?.url ?? null,
            sku: variant.sku,
            category: product.productType || null,
            msrp: msrp || null,
            wholesalePrice,
            moq: 1,
            casePack: 1,
            stockStatus: inventory > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
            inventoryQty: inventory,
            isActive: true,
            syncedAt: new Date(),
          },
          update: {
            handle: product.handle,
            title: product.title,
            description: product.description,
            imageUrl: product.featuredImage?.url ?? null,
            sku: variant.sku,
            category: product.productType || null,
            msrp: msrp || null,
            wholesalePrice,
            stockStatus: inventory > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
            inventoryQty: inventory,
            isActive: true,
            syncedAt: new Date(),
          },
        });

        recordsRead += 1;
        recordsUpserted += 1;

        if (recordsRead >= limit) {
          break;
        }
      }

      hasNextPage = payload.data?.products?.pageInfo?.hasNextPage ?? false;
      after = payload.data?.products?.pageInfo?.endCursor ?? null;

      if (!products.length) {
        break;
      }
    }

    await prisma.productSyncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        recordsRead,
        recordsUpserted,
      },
    });

    return {
      jobId: job.id,
      recordsRead,
      recordsUpserted,
      status: "SUCCESS",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";

    await prisma.productSyncJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: message,
      },
    });

    return {
      jobId: job.id,
      recordsRead: 0,
      recordsUpserted: 0,
      status: "FAILED",
      message,
    };
  }
}
