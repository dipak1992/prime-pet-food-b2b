import Link from "next/link";
import Image from "next/image";
import { Package, LayoutDashboard, ShoppingCart, Receipt, UserCircle, LifeBuoy, Download, ShoppingBag } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Catalog", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/account", label: "Account", icon: UserCircle },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/downloads", label: "Downloads", icon: Download },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
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
        <aside className="rounded-2xl border border-[#e7e4dc] bg-white p-3">
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#f8f7f4] hover:text-[#1d4b43]"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
