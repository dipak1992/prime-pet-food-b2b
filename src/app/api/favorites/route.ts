import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await requireApprovedBuyer();
    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { customerId: profile.customerId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            sku: true,
            wholesalePrice: true,
            msrp: true,
            moq: true,
            casePack: true,
          },
        },
      },
    });

    return NextResponse.json({
      favorites: favorites.map((fav) => fav.product),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();
    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const { productId } = await req.json();

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        customerId_productId: {
          customerId: profile.customerId,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already favorited" }, { status: 400 });
    }

    await prisma.favorite.create({
      data: {
        customerId: profile.customerId,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();
    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const { productId } = await req.json();

    await prisma.favorite.delete({
      where: {
        customerId_productId: {
          customerId: profile.customerId,
          productId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
