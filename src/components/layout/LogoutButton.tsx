"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={
        className ??
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#6b7280] transition hover:bg-red-50 hover:text-red-600"
      }
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}
