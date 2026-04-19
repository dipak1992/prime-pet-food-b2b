import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await requireApprovedBuyer();

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    let isFavorite = false;
    let customerMargin = 0;

    // Check if favorited
    const favorite = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId: profile.customerId,
          productId: id,
        },
      },
    });
    isFavorite = !!favorite;

    // Check for customer-specific wholesale override
    const override = await prisma.customerPriceOverride.findUnique({
      where: {
        customerId_productId: {
          customerId: profile.customerId,
          productId: id,
        },
      },
    });

    const effectiveWholesale = override
      ? Number(override.wholesalePrice)
      : Number(product.wholesalePrice);

    if (product.msrp) {
      const margin = ((Number(product.msrp) - effectiveWholesale) / Number(product.msrp)) * 100;
      customerMargin = Math.max(0, Math.round(margin));
    }

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        sku: product.sku,
        moq: product.moq,
        casePack: product.casePack,
        wholesalePrice: effectiveWholesale,
        msrp: product.msrp ? Number(product.msrp) : null,
        customerMargin,
      },
      isFavorite,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
