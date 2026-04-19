import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as { adminNotes?: string };

  const application = await prisma.$transaction(async (tx) => {
    const application = await tx.wholesaleApplication.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedById: admin.userId,
        adminNotes: payload.adminNotes || null,
      },
    });

    await tx.user.updateMany({
      where: { email: application.email.toLowerCase() },
      data: { status: "REJECTED" },
    });

    return application;
  });

  await sendEmail({
    to: application.email.toLowerCase(),
    template: "application-rejected",
    variables: {
      businessName: application.businessName,
    },
  }).catch((error) => {
    console.error("Failed to send rejection email", error);
  });

  return NextResponse.json({ success: true });
}
