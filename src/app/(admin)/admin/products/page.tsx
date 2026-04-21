import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { ShopifySyncPanel } from "@/components/admin/ShopifySyncPanel";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, tokenSetting, domainSetting] = await Promise.all([
    prisma.product.findMany({
      orderBy: { title: "asc" },
      take: 300,
      select: {
        id: true,
        title: true,
        sku: true,
        category: true,
        wholesalePrice: true,
        msrp: true,
        moq: true,
        casePack: true,
        isBestSeller: true,
        inventoryQty: true,
        stockStatus: true,
        isActive: true,
        syncedAt: true,
        imageUrl: true,
      },
    }),
    prisma.setting.findUnique({ where: { key: "shopify_access_token" } }),
    prisma.setting.findUnique({ where: { key: "shopify_store_domain" } }),
  ]);

  const isConnected = !!tokenSetting?.value;
  const shopDomain = domainSetting?.value ?? null;

  return (
    <SectionCard title="Product Catalog" description="Manage product availability and sync health.">
      <Suspense>
        <ShopifySyncPanel isConnected={isConnected} shopDomain={shopDomain} />
      </Suspense>
      <ProductsTable
        initialProducts={products.map((p) => ({
          ...p,
          wholesalePrice: Number(p.wholesalePrice),
          msrp: p.msrp ? Number(p.msrp) : null,
          syncedAt: p.syncedAt ? p.syncedAt.toISOString() : null,
        }))}
      />
    </SectionCard>
  );
}
