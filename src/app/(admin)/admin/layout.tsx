import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-[#111827]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="text-lg font-semibold text-[#1f2a44]">
            Prime Pet Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-[#374151]">
            <Link href="/admin/analytics">Analytics</Link>
            <Link href="/admin/applications">Applications</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/admin/customers">Customers</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
