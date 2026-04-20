import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};

  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.isBestSeller === "boolean") data.isBestSeller = body.isBestSeller;
  if (typeof body.wholesalePrice === "number" && body.wholesalePrice >= 0)
    data.wholesalePrice = body.wholesalePrice;
  if (body.msrp === null || (typeof body.msrp === "number" && body.msrp >= 0))
    data.msrp = body.msrp;
  if (typeof body.moq === "number" && body.moq >= 1) data.moq = body.moq;
  if (typeof body.casePack === "number" && body.casePack >= 1) data.casePack = body.casePack;
  if (typeof body.category === "string") data.category = body.category.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    product: {
      ...product,
      msrp: product.msrp ? Number(product.msrp) : null,
      wholesalePrice: Number(product.wholesalePrice),
    },
  });
}
