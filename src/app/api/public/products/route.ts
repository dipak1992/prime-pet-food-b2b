import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — NEVER include wholesalePrice, moq, casePack, or costPrice
export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ isBestSeller: "desc" }, { title: "asc" }],
    take: 200,
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      sku: true,
      category: true,
      stockStatus: true,
      isBestSeller: true,
      msrp: true,
    },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      msrp: p.msrp ? Number(p.msrp) : null,
    })),
  });
}
