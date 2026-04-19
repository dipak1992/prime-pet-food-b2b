import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    notFound();
  }

  return (
    <SectionCard title={product.title} description="Wholesale product details">
      <div className="space-y-2 text-sm text-[#374151]">
        <p>SKU: {product.sku || "-"}</p>
        <p>MOQ: {product.moq}</p>
        <p>Case pack: {product.casePack}</p>
        <p>Wholesale: ${Number(product.wholesalePrice).toFixed(2)}</p>
        <p>MSRP: {product.msrp ? `$${Number(product.msrp).toFixed(2)}` : "-"}</p>
      </div>
    </SectionCard>
  );
}
