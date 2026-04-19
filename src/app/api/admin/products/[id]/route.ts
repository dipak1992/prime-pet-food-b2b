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
  const { isActive } = body;

  if (typeof isActive !== "boolean") {
    return NextResponse.json({ error: "isActive must be boolean" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({
    product: {
      ...product,
      msrp: product.msrp ? Number(product.msrp) : null,
      wholesalePrice: Number(product.wholesalePrice),
    },
  });
}
