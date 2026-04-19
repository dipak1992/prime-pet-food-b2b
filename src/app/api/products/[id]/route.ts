import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let isFavorite = false;
    let customerMargin = 0;
    let customPrice = null;

    if (userId) {
      const customer = await db.customer.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      });

      if (customer) {
        // Check if favorited
        const favorite = await db.favorite.findUnique({
          where: {
            customerId_productId: {
              customerId: customer.id,
              productId: id,
            },
          },
        });
        isFavorite = !!favorite;

        // Check for custom pricing
        const override = await db.customerPriceOverride.findUnique({
          where: {
            customerId_productId: {
              customerId: customer.id,
              productId: id,
            },
          },
        });

        if (override) {
          customPrice = override.customPrice;
          const margin = ((Number(override.customPrice) - Number(product.wholesalePrice)) / Number(override.customPrice)) * 100;
          customerMargin = Math.round(margin);
        }
      }
    }

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        sku: product.sku,
        moq: product.moq,
        casePack: product.casePack,
        wholesalePrice: Number(product.wholesalePrice),
        msrp: product.msrp ? Number(product.msrp) : null,
        customerMargin,
        customPrice,
      },
      isFavorite,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
