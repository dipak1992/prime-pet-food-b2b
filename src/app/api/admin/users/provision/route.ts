import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { ensureAuthUser } from "@/lib/supabase/admin";

type ProvisionAdminPayload = {
  email?: string;
  name?: string;
  password?: string;
  mustChangePassword?: boolean;
};

export async function POST(request: NextRequest) {
  await requireAdmin();

  const payload = (await request.json().catch(() => ({}))) as ProvisionAdminPayload;
  const email = payload.email?.trim().toLowerCase();
  const name = payload.name?.trim();

  if (!email || !name) {
    return NextResponse.json({ error: "email and name are required" }, { status: 400 });
  }

  try {
    const authUser = await ensureAuthUser({
      email,
      name,
      password: payload.password,
      mustChangePassword: Boolean(payload.mustChangePassword),
    });

    const appUser = await prisma.user.upsert({
      where: { email },
      create: {
        authUserId: authUser.id,
        email,
        name,
        role: "ADMIN",
        status: "APPROVED",
      },
      update: {
        authUserId: authUser.id,
        name,
        role: "ADMIN",
        status: "APPROVED",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: appUser.id,
        email: appUser.email,
        role: appUser.role,
        status: appUser.status,
      },
    });
  } catch (error) {
    console.error("Failed to provision admin user", error);
    return NextResponse.json({ error: "Failed to provision admin user" }, { status: 500 });
  }
}
