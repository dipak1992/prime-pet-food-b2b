import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const lastSync = await prisma.productSyncJob.findFirst({
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  const syncHistory = await prisma.productSyncJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json({
    lastSync,
    history: syncHistory,
    scheduledInterval: "Every 6 hours",
    nextSyncEstimate: lastSync
      ? new Date(new Date(lastSync.createdAt).getTime() + 6 * 60 * 60 * 1000).toISOString()
      : null,
  });
}
