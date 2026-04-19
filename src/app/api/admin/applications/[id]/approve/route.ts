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

  await prisma.$transaction(async (tx) => {
    const application = await tx.wholesaleApplication.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedById: admin.userId,
        adminNotes: payload.adminNotes || null,
      },
    });

    const user = await tx.user.upsert({
      where: { email: application.email.toLowerCase() },
      create: {
        email: application.email.toLowerCase(),
        name: application.contactName,
        role: "BUYER",
        status: "APPROVED",
      },
      update: {
        status: "APPROVED",
      },
    });

    await tx.customer.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        businessName: application.businessName,
        businessType: application.businessType,
        accountStatus: "APPROVED",
        approvedAt: new Date(),
      },
      update: {
        businessName: application.businessName,
        businessType: application.businessType,
        accountStatus: "APPROVED",
        approvedAt: new Date(),
      },
    });
  });

  return NextResponse.json({ success: true });
}
