/**
 * GET  /api/admin/ai/leads   – List leads with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const minScore = searchParams.get("minScore");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (minScore) where.leadScore = { gte: parseInt(minScore, 10) };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: [{ leadScore: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: {
        emails: {
          select: { id: true, subject: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: {
          select: { emails: true, activities: true },
        },
      },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
