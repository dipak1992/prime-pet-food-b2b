import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { title: "asc" },
    take: 300,
    select: {
      id: true,
      title: true,
      sku: true,
      category: true,
      wholesalePrice: true,
      inventoryQty: true,
      stockStatus: true,
      isActive: true,
      syncedAt: true,
    },
  });

  return (
    <SectionCard title="Product Catalog" description="Manage product availability and sync health.">
      <ProductsTable
        initialProducts={products.map((p) => ({
          ...p,
          wholesalePrice: Number(p.wholesalePrice),
          syncedAt: p.syncedAt ? p.syncedAt.toISOString() : null,
        }))}
      />
    </SectionCard>
  );
}
