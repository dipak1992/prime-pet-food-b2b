import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionProfile = {
  userId: string;
  email: string;
  role: "ADMIN" | "BUYER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  customerId?: string;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
    include: { customer: true },
  });

  if (!dbUser) {
    return null;
  }

  return {
    userId: dbUser.id,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    customerId: dbUser.customer?.id,
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

  if (profile.role !== "BUYER") {
    redirect("/admin");
  }

  if (profile.status !== "APPROVED") {
    redirect("/login?status=pending");
  }

  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();

  if (profile.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return profile;
}
