import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = new Set(["admin@theprimepetfood.com", "admin@theperimeprtfood.com"]);
const MAX_MAGIC_LINK_AGE_MS = 60_000;

function getSafeNextPath(input: string | null): string {
  if (!input || !input.startsWith("/") || input.startsWith("//")) {
    return "/admin";
  }

  return input;
}

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
  const next = getSafeNextPath(url.searchParams.get("next"));
  const issuedAtParam = url.searchParams.get("issuedAt");
  const origin = url.origin;

  const issuedAt = issuedAtParam ? Number(issuedAtParam) : NaN;
  const isExpired = Number.isNaN(issuedAt) || Date.now() - issuedAt > MAX_MAGIC_LINK_AGE_MS;

  if (isExpired) {
    return NextResponse.redirect(`${origin}/login?status=expired`);
  }

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

  if (ADMIN_EMAILS.has(email)) {
    await prisma.user.upsert({
      where: { email },
      create: {
        authUserId: authUser.id,
        email,
        name: getSafeName(email, authUser.user_metadata?.full_name),
        role: "ADMIN",
        status: "APPROVED",
        lastLoginAt: new Date(),
      },
      update: {
        authUserId: authUser.id,
        role: "ADMIN",
        status: "APPROVED",
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.redirect(`${origin}${next}`);
  }

  // Check if user already exists in system
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  // If user exists and is admin, redirect to admin portal
  if (existingUser && existingUser.role === "ADMIN") {
    await prisma.user.update({
      where: { email },
      data: {
        authUserId: authUser.id,
        lastLoginAt: new Date(),
      },
    });
    return NextResponse.redirect(`${origin}/admin`);
  }

  // For buyers, check application status
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

  // Redirect buyers based on approval status
  if (profile.status === "APPROVED") {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  if (profile.status === "REJECTED") {
    return NextResponse.redirect(`${origin}/access-rejected`);
  }

  if (profile.status === "SUSPENDED") {
    return NextResponse.redirect(`${origin}/access-suspended`);
  }

  return NextResponse.redirect(`${origin}/access-pending`);
}
