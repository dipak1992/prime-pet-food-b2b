import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — NEVER include wholesalePrice, moq, casePack, or costPrice
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const product = await prisma.product.findFirst({
    where: { id, isActive: true },
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

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    product: { ...product, msrp: product.msrp ? Number(product.msrp) : null },
  });
}
