import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as { adminNotes?: string };

  await prisma.wholesaleApplication.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: admin.userId,
      adminNotes: payload.adminNotes || null,
    },
  });

  return NextResponse.json({ success: true });
}
