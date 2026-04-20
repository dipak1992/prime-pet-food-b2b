import { NextRequest, NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: profile.userId },
    select: {
      id: true,
      name: true,
      email: true,
      customer: {
        select: {
          id: true,
          businessName: true,
          businessType: true,
          tier: true,
          accountStatus: true,
          addresses: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  return NextResponse.json({ authenticated: true, profile, user });
}

export async function PATCH(req: NextRequest) {
  const profile = await getSessionProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, businessName } = body as { name?: string; businessName?: string };

  const user = await prisma.user.update({
    where: { authUserId: profile.userId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(businessName !== undefined && {
        customer: { update: { businessName: businessName.trim() } },
      }),
    },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}

