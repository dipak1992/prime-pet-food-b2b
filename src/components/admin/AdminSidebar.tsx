"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "⊞" },
  { label: "Applications", href: "/admin/applications", icon: "📋" },
  { label: "Customers", href: "/admin/customers", icon: "👥" },
  { label: "Products", href: "/admin/products", icon: "📦" },
  { label: "Orders", href: "/admin/orders", icon: "🛒" },
  { label: "Invoices", href: "/admin/invoices", icon: "🧾" },
  { label: "Analytics", href: "/admin/analytics", icon: "📊" },
  { label: "Reorders", href: "/admin/reorders", icon: "🔄" },
  { label: "Outreach", href: "/admin/outreach", icon: "📣" },
  { label: "Support", href: "/admin/support", icon: "💬" },
  { label: "Assets", href: "/admin/assets", icon: "🗂" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navContent = (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive(item.href)
              ? "bg-[#1d4b43] text-white"
              : "text-[#374151] hover:bg-[#e7e4dc] hover:text-[#111827]"
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col border-r border-[#e7e4dc] bg-white shrink-0">
        <div className="border-b border-[#e7e4dc] px-5 py-4">
          <Link href="/admin" className="text-base font-bold text-[#1d4b43]">
            Prime Pet
          </Link>
          <p className="text-xs text-[#6b7280] mt-0.5">Admin Portal</p>
        </div>
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-[#e7e4dc] bg-white px-4 py-3">
        <Link href="/admin" className="text-base font-bold text-[#1d4b43]">
          Prime Pet Admin
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-1.5 text-[#374151] hover:bg-[#f7f7fb]"
          aria-label="Toggle navigation"
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-[#e7e4dc] px-5 py-4 mt-14">
              <p className="text-xs text-[#6b7280]">Navigation</p>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      {/* Mobile top bar spacer */}
      <div className="lg:hidden h-[53px] w-full" />
    </>
  );
}
