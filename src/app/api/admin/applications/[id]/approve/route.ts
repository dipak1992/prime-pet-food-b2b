import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ensureAuthUser, generateSetPasswordLink } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const payload = (await request.json().catch(() => ({}))) as { adminNotes?: string };

  const existingApplication = await prisma.wholesaleApplication.findUnique({ where: { id } });
  if (!existingApplication) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const email = existingApplication.email.toLowerCase();
  const appOrigin = new URL(request.url).origin;
  const setPasswordRedirect = `${appOrigin}/reset-password`;

  let setPasswordUrl = "";
  let authUserId: string | undefined;

  try {
    const authUser = await ensureAuthUser({
      email,
      name: existingApplication.contactName,
      mustChangePassword: false,
    });

    authUserId = authUser.id;
    setPasswordUrl = await generateSetPasswordLink({
      email,
      redirectTo: setPasswordRedirect,
    });
  } catch (error) {
    console.error("Failed to provision buyer auth user", error);
    return NextResponse.json(
      { error: "Could not provision buyer login account. Check Supabase configuration." },
      { status: 500 }
    );
  }

  const application = await prisma.$transaction(async (tx) => {
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
      where: { email },
      create: {
        authUserId,
        email,
        name: application.contactName,
        role: "BUYER",
        status: "APPROVED",
      },
      update: {
        authUserId,
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

    return application;
  });

  await sendEmail({
    to: email,
    template: "application-approved",
    variables: {
      businessName: application.businessName,
      loginUrl: `${appOrigin}/login`,
      setPasswordUrl,
    },
  }).catch((error) => {
    console.error("Failed to send approval email", error);
  });

  return NextResponse.json({ success: true });
}
