"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  UserCircle,
  LifeBuoy,
  Download,
  ShoppingBag,
  Zap,
  FileQuestion,
} from "lucide-react";
import { CartBadge } from "@/components/portal/CartBadge";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Catalog", icon: Package },
  { href: "/quick-order", label: "Quick Order", icon: Zap },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/quote", label: "Quote/Samples", icon: FileQuestion },
  { href: "/account", label: "Account", icon: UserCircle },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/downloads", label: "Downloads", icon: Download },
];

export function PortalNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewAs = searchParams.get("viewAs");

  return (
    <nav className="space-y-1">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const href = viewAs ? `${item.href}?viewAs=${viewAs}` : item.href;
        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-[#ea580c]/10 text-[#ea580c]"
                : "text-[#374151] hover:bg-[#f8f7f4] hover:text-[#ea580c]"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
            {item.badge && <CartBadge />}
          </Link>
        );
      })}
    </nav>
  );
}
