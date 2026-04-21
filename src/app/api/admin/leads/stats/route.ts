import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  await requireAdmin();

  const [byStatus, byTemperature, total, thisMonth] = await Promise.all([
    prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by: ["leadTemperature"],
      _count: { id: true },
    }),
    prisma.lead.count(),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    byStatus.map((r) => [r.status, r._count.id])
  );
  const temperatureCounts = Object.fromEntries(
    byTemperature
      .filter((r) => r.leadTemperature)
      .map((r) => [r.leadTemperature as string, r._count.id])
  );

  return NextResponse.json({ total, thisMonth, byStatus: statusCounts, byTemperature: temperatureCounts });
}
