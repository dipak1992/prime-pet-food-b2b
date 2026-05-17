import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await requireApprovedBuyer();

  const [products, favorites, orderedItems] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isBestSeller: "desc" }, { title: "asc" }],
      take: 100,
    }),
    profile.customerId
      ? prisma.favorite.findMany({
          where: { customerId: profile.customerId },
          select: { productId: true },
        })
      : Promise.resolve([]),
    profile.customerId
      ? prisma.orderItem.findMany({
          where: { order: { customerId: profile.customerId } },
          select: { productId: true },
          distinct: ["productId"],
        })
      : Promise.resolve([]),
  ]);

  const favoriteIds = new Set(favorites.map((favorite) => favorite.productId));
  const previouslyOrderedIds = new Set(orderedItems.map((item) => item.productId));

  return NextResponse.json({
    products: products.map((product) => ({
      ...product,
      wholesalePrice: Number(product.wholesalePrice),
      msrp: product.msrp == null ? null : Number(product.msrp),
      isFavorite: favoriteIds.has(product.id),
      previouslyOrdered: previouslyOrderedIds.has(product.id),
    })),
  });
}
