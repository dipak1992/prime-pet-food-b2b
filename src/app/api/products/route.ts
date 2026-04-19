import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireApprovedBuyer();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" },
    take: 100,
  });

  return NextResponse.json({ products });
}
