import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bundles = await db.bundle.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      bundles: bundles.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        bundlePrice: b.bundlePrice,
        items: b.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
        })),
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
