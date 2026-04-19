import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await requireApprovedBuyer();
    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const bundles = await prisma.bundle.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sku: true,
                wholesalePrice: true,
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
        bundlePrice: b.items.reduce(
          (sum, item) => sum + Number(item.product.wholesalePrice) * item.quantity,
          0
        ),
        items: b.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          product: {
            ...item.product,
            wholesalePrice: Number(item.product.wholesalePrice),
          },
        })),
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
