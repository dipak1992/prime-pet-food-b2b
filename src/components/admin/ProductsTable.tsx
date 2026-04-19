"use client";

import { useState } from "react";

type ProductRow = {
  id: string;
  title: string;
  sku: string | null;
  category: string | null;
  wholesalePrice: number;
  inventoryQty: number | null;
  stockStatus: string;
  isActive: boolean;
  syncedAt: string | null;
};

export function ProductsTable({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function toggleActive(product: ProductRow) {
    try {
      setUpdatingId(product.id);
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update product");

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (products.length === 0) {
    return <p className="text-sm text-[#4b5563]">No products available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-[#111827]">Name</th>
            <th className="px-3 py-2 text-left font-semibold text-[#111827]">SKU</th>
            <th className="px-3 py-2 text-left font-semibold text-[#111827]">Category</th>
            <th className="px-3 py-2 text-right font-semibold text-[#111827]">Price</th>
            <th className="px-3 py-2 text-right font-semibold text-[#111827]">Inventory</th>
            <th className="px-3 py-2 text-left font-semibold text-[#111827]">Stock</th>
            <th className="px-3 py-2 text-left font-semibold text-[#111827]">Status</th>
            <th className="px-3 py-2 text-left font-semibold text-[#111827]">Last Sync</th>
            <th className="px-3 py-2 text-right font-semibold text-[#111827]">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e7e4dc]">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-[#f7f7fb]">
              <td className="px-3 py-3 font-medium text-[#111827]">{product.title}</td>
              <td className="px-3 py-3 text-[#4b5563]">{product.sku || "-"}</td>
              <td className="px-3 py-3 text-[#4b5563]">{product.category || "Uncategorized"}</td>
              <td className="px-3 py-3 text-right font-semibold text-[#111827]">
                ${product.wholesalePrice.toFixed(2)}
              </td>
              <td className="px-3 py-3 text-right text-[#4b5563]">{product.inventoryQty ?? "-"}</td>
              <td className="px-3 py-3 text-[#4b5563]">{product.stockStatus}</td>
              <td className="px-3 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {product.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </td>
              <td className="px-3 py-3 text-xs text-[#6b7280]">
                {product.syncedAt
                  ? new Date(product.syncedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Never"}
              </td>
              <td className="px-3 py-3 text-right">
                <button
                  onClick={() => toggleActive(product)}
                  disabled={updatingId === product.id}
                  className="rounded border border-[#e7e4dc] px-3 py-1 text-xs font-semibold text-[#111827] hover:bg-[#f3f1eb] disabled:opacity-60"
                >
                  {updatingId === product.id ? "Saving..." : product.isActive ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
