import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionProfile = {
  userId: string;
  email: string;
  role: "ADMIN" | "BUYER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  customerId?: string;
  mustChangePassword: boolean;
};

function redirectBuyerByStatus(status: SessionProfile["status"]) {
  if (status === "APPROVED") {
    redirect("/dashboard");
  }

  if (status === "REJECTED") {
    redirect("/access-rejected");
  }

  if (status === "SUSPENDED") {
    redirect("/access-suspended");
  }

  redirect("/access-pending");
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let dbUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
    include: { customer: true },
  });

  // Fallback for accounts created before authUserId was persisted.
  if (!dbUser && user.email) {
    const email = user.email.toLowerCase();
    dbUser = await prisma.user.findUnique({
      where: { email },
      include: { customer: true },
    });

    if (dbUser && !dbUser.authUserId) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: { authUserId: user.id },
        include: { customer: true },
      });
    }
  }

  if (!dbUser) {
    return null;
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    customerId: dbUser.customer?.id,
    mustChangePassword: Boolean(user.user_metadata?.must_change_password),
  };
}

export async function requireAuth() {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireApprovedBuyer() {
  const profile = await requireAuth();
  const headersList = await headers();
  const viewAs = headersList.get("x-view-as") || null;

  if (profile.mustChangePassword) {
    redirect("/reset-password");
  }

  // Admins can freely access buyer portal pages (viewAs mode or direct navigation)
  if (profile.role === "ADMIN") {
    return profile;
  }

  if (profile.role !== "BUYER") {
    redirect("/admin");
  }

  if (profile.status !== "APPROVED") {
    redirectBuyerByStatus(profile.status);
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();

  if (profile.mustChangePassword) {
    redirect("/reset-password");
  }

  if (profile.role !== "ADMIN") {
    redirectBuyerByStatus(profile.status);
  }

  return profile;
}

export type PublicSessionInfo = {
  isLoggedIn: boolean;
  isApproved: boolean;
  status: SessionProfile["status"] | null;
  role: SessionProfile["role"] | null;
};

/**
 * Non-redirecting helper for public/catalog pages.
 * Returns basic session info without redirecting.
 */
export async function getPublicSessionInfo(): Promise<PublicSessionInfo> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { isLoggedIn: false, isApproved: false, status: null, role: null };
  }
  return {
    isLoggedIn: true,
    isApproved: profile.role === "BUYER" && profile.status === "APPROVED",
    status: profile.status,
    role: profile.role,
  };
}
