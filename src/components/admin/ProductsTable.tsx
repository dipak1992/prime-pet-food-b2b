"use client";

import { useState } from "react";

type ProductRow = {
  id: string;
  title: string;
  sku: string | null;
  category: string | null;
  wholesalePrice: number;
  msrp: number | null;
  moq: number;
  casePack: number;
  isBestSeller: boolean;
  inventoryQty: number | null;
  stockStatus: string;
  isActive: boolean;
  syncedAt: string | null;
};

type EditForm = {
  wholesalePrice: string;
  msrp: string;
  moq: string;
  casePack: string;
  category: string;
  isBestSeller: boolean;
};

export function ProductsTable({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState<ProductRow[]>(initialProducts);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  function openEdit(product: ProductRow) {
    setEditingProduct(product);
    setEditForm({
      wholesalePrice: product.wholesalePrice.toFixed(2),
      msrp: product.msrp != null ? product.msrp.toFixed(2) : "",
      moq: String(product.moq),
      casePack: String(product.casePack),
      category: product.category ?? "",
      isBestSeller: product.isBestSeller,
    });
    setEditError(null);
  }

  function closeEdit() {
    setEditingProduct(null);
    setEditForm(null);
    setEditError(null);
  }

  async function saveEdit() {
    if (!editingProduct || !editForm) return;
    const wholesalePrice = parseFloat(editForm.wholesalePrice);
    const msrp = editForm.msrp.trim() !== "" ? parseFloat(editForm.msrp) : null;
    const moq = parseInt(editForm.moq);
    const casePack = parseInt(editForm.casePack);

    if (isNaN(wholesalePrice) || wholesalePrice < 0) {
      setEditError("Wholesale price must be a valid number.");
      return;
    }
    if (msrp !== null && isNaN(msrp)) {
      setEditError("MSRP must be a valid number.");
      return;
    }
    if (isNaN(moq) || moq < 1) {
      setEditError("MOQ must be at least 1.");
      return;
    }
    if (isNaN(casePack) || casePack < 1) {
      setEditError("Case pack must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setEditError(null);
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wholesalePrice,
          msrp,
          moq,
          casePack,
          category: editForm.category,
          isBestSeller: editForm.isBestSeller,
        }),
      });
      if (!res.ok) throw new Error("Failed to save changes");
      const { product: updated } = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                wholesalePrice: updated.wholesalePrice,
                msrp: updated.msrp,
                moq: updated.moq,
                casePack: updated.casePack,
                category: updated.category,
                isBestSeller: updated.isBestSeller,
              }
            : p
        )
      );
      closeEdit();
    } catch {
      setEditError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

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
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-[#111827]">Name</th>
              <th className="px-3 py-2 text-left font-semibold text-[#111827]">SKU</th>
              <th className="px-3 py-2 text-left font-semibold text-[#111827]">Category</th>
              <th className="px-3 py-2 text-right font-semibold text-[#111827]">Wholesale</th>
              <th className="px-3 py-2 text-right font-semibold text-[#111827]">MSRP</th>
              <th className="px-3 py-2 text-right font-semibold text-[#111827]">MOQ</th>
              <th className="px-3 py-2 text-right font-semibold text-[#111827]">Inventory</th>
              <th className="px-3 py-2 text-left font-semibold text-[#111827]">Status</th>
              <th className="px-3 py-2 text-right font-semibold text-[#111827]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e7e4dc]">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#f7f7fb]">
                <td className="px-3 py-3 font-medium text-[#111827]">
                  {product.title}
                  {product.isBestSeller && (
                    <span className="ml-1.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
                      ★ Best Seller
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-[#4b5563]">{product.sku || "-"}</td>
                <td className="px-3 py-3 text-[#4b5563]">{product.category || "Uncategorized"}</td>
                <td className="px-3 py-3 text-right font-semibold text-[#111827]">
                  ${product.wholesalePrice.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right text-[#4b5563]">
                  {product.msrp != null ? `$${product.msrp.toFixed(2)}` : "-"}
                </td>
                <td className="px-3 py-3 text-right text-[#4b5563]">{product.moq}</td>
                <td className="px-3 py-3 text-right text-[#4b5563]">{product.inventoryQty ?? "-"}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {product.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="rounded border border-[#e7e4dc] px-3 py-1 text-xs font-semibold text-[#111827] hover:bg-[#f3f1eb]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(product)}
                      disabled={updatingId === product.id}
                      className="rounded border border-[#e7e4dc] px-3 py-1 text-xs font-semibold text-[#111827] hover:bg-[#f3f1eb] disabled:opacity-60"
                    >
                      {updatingId === product.id ? "Saving..." : product.isActive ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && editForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-[#111827]">Edit Product</h2>
            <p className="mb-5 text-sm text-[#6b7280]">{editingProduct.title}</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">
                    Wholesale Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.wholesalePrice}
                    onChange={(e) => setEditForm({ ...editForm, wholesalePrice: e.target.value })}
                    className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">
                    MSRP ($) <span className="font-normal text-[#9ca3af]">optional</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.msrp}
                    onChange={(e) => setEditForm({ ...editForm, msrp: e.target.value })}
                    className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                    placeholder="—"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">
                    Min Order Qty (MOQ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.moq}
                    onChange={(e) => setEditForm({ ...editForm, moq: e.target.value })}
                    className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#374151]">
                    Case Pack
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.casePack}
                    onChange={(e) => setEditForm({ ...editForm, casePack: e.target.value })}
                    className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#374151]">
                  Category <span className="font-normal text-[#9ca3af]">optional</span>
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                  placeholder="e.g. Dry Food, Treats"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isBestSeller}
                  onChange={(e) => setEditForm({ ...editForm, isBestSeller: e.target.checked })}
                  className="h-4 w-4 accent-[#111827]"
                />
                <span className="text-sm font-medium text-[#374151]">Mark as Best Seller</span>
              </label>
            </div>

            {editError && (
              <p className="mt-3 text-sm text-red-600">{editError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeEdit}
                disabled={saving}
                className="rounded border border-[#e7e4dc] px-4 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f3f1eb] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="rounded bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
