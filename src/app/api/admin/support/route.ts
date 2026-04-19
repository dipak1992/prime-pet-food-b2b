import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireAdmin();

  const requests = await prisma.supportRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      customer: {
        select: {
          id: true,
          businessName: true,
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  return NextResponse.json({ supportRequests: requests });
}
