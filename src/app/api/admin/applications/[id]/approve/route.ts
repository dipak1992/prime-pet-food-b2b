import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await context.params;

  const application = await prisma.wholesaleApplication.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: admin.userId,
    },
  });

  await prisma.user.updateMany({
    where: { email: application.email },
    data: { status: "APPROVED" },
  });

  return NextResponse.json({ success: true });
}
