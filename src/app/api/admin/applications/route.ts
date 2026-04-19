import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const applications = await prisma.wholesaleApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ applications });
}
