"use client";

import { useEffect, useState } from "react";

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.cart?.items) {
          setCount(data.cart.items.length);
        }
      })
      .catch(() => {});
  }, []);

  if (!count) return null;

  return (
    <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#1d4b43] px-1 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
