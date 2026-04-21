import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  await requireAdmin();

  const { names } = await req.json() as { names?: string[] };
  if (!Array.isArray(names) || names.length === 0) {
    return NextResponse.json({ error: "names array is required" }, { status: 400 });
  }

  const existing = await prisma.lead.findMany({
    where: { businessName: { in: names } },
    select: { id: true, businessName: true, email: true },
  });

  return NextResponse.json({ duplicates: existing });
}
