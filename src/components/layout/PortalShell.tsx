import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { PortalNavLinks } from "@/components/portal/PortalNavLinks";
import { LogoutButton } from "@/components/layout/LogoutButton";
import type { SessionProfile } from "@/lib/auth/guards";

interface PortalShellProps {
  children: React.ReactNode;
  profile?: SessionProfile | null;
}

export function PortalShell({ children, profile }: PortalShellProps) {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1f2937]">
      <header className="border-b border-[#e7e4dc] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/logoedited.jpg"
              alt="Prime Pet Food Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-[#1d4b43]">
              Prime Pet Wholesale
            </Link>
          </div>
          <Link href="/products" className="rounded-full bg-[#1d4b43] px-4 py-2 text-sm font-medium text-white">
            Quick Order
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="flex flex-col rounded-2xl border border-[#e7e4dc] bg-white p-3">
          <div className="flex-1">
            <PortalNavLinks />
          </div>

          <div className="mt-4 border-t border-[#e7e4dc] pt-3">
            {profile?.email && (
              <div className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2">
                <UserCircle className="size-5 shrink-0 text-[#6b7280]" />
                <p className="truncate text-xs text-[#6b7280]">{profile.email}</p>
              </div>
            )}
            <LogoutButton />
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
