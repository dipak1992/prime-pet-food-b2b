import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeName(email: string, fallback?: string | null): string {
  if (fallback && fallback.trim().length > 1) {
    return fallback.trim();
  }

  const localPart = email.split("@")[0] || "Wholesale Buyer";
  return localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const email = authUser.email.toLowerCase();
  const latestApplication = await prisma.wholesaleApplication.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  const derivedStatus =
    latestApplication?.status === "APPROVED"
      ? "APPROVED"
      : latestApplication?.status === "REJECTED"
        ? "REJECTED"
        : "PENDING";

  const profile = await prisma.user.upsert({
    where: { email },
    create: {
      authUserId: authUser.id,
      email,
      name: getSafeName(email, authUser.user_metadata?.full_name ?? latestApplication?.contactName),
      role: "BUYER",
      status: derivedStatus,
      lastLoginAt: new Date(),
    },
    update: {
      authUserId: authUser.id,
      lastLoginAt: new Date(),
      status: derivedStatus,
    },
  });

  if (profile.status === "APPROVED") {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  if (profile.status === "REJECTED") {
    return NextResponse.redirect(`${origin}/login?status=rejected`);
  }

  return NextResponse.redirect(`${origin}/login?status=pending`);
}
