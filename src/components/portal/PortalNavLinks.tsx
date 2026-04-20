"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  UserCircle,
  LifeBuoy,
  Download,
  ShoppingBag,
} from "lucide-react";
import { CartBadge } from "@/components/portal/CartBadge";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Catalog", icon: Package },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/cart", label: "Cart", icon: ShoppingBag, badge: true },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/account", label: "Account", icon: UserCircle },
  { href: "/support", label: "Support", icon: LifeBuoy },
  { href: "/downloads", label: "Downloads", icon: Download },
];

export function PortalNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-[#1d4b43]/10 text-[#1d4b43]"
                : "text-[#374151] hover:bg-[#f8f7f4] hover:text-[#1d4b43]"
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
