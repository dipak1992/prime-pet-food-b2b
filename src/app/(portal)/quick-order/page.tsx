"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

type Product = {
  id: string;
  title: string;
  sku: string | null;
  category?: string | null;
  wholesalePrice: number;
  msrp?: number | null;
  moq: number;
  casePack: number;
  stockStatus?: string;
  isBestSeller?: boolean;
};

type ProductsResponse = { products: Product[] };

function nextValidQuantity(value: number, product: Product) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const base = Math.max(value, product.moq);
  return Math.ceil(base / product.casePack) * product.casePack;
}

function marginPercent(product: Product) {
  if (!product.msrp || product.msrp <= 0) return null;
  return Math.round(((product.msrp - product.wholesalePrice) / product.msrp) * 100);
}

export default function QuickOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data: ProductsResponse = await res.json();
      setProducts(data.products);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return products;
    return products.filter((product) =>
      [product.title, product.sku || "", product.category || ""].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [products, query]);

  const selected = products
    .map((product) => ({ product, quantity: quantities[product.id] || 0 }))
    .filter(({ quantity }) => quantity > 0);

  const selectedTotal = selected.reduce(
    (sum, { product, quantity }) => sum + product.wholesalePrice * quantity,
    0
  );

  async function addSelectedToCart() {
    setSubmitting(true);
    setMessage("");
    setError("");
    try {
      for (const { product, quantity } of selected) {
        const normalizedQuantity = nextValidQuantity(quantity, product);
        const res = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id, quantity: normalizedQuantity }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || `Could not add ${product.title}`);
        }
      }
      setMessage(`Added ${selected.length} SKU${selected.length === 1 ? "" : "s"} to cart.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add selected products");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SectionCard title="Quick order" description="Fast SKU entry for repeat wholesale buyers.">
        <p className="text-sm text-[#4b5563]">Loading products...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Quick order" description="Enter case-pack quantities and add multiple SKUs at once.">
      <div className="space-y-4">
        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}{" "}
            <Link href="/cart" className="font-semibold underline">
              View cart
            </Link>
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SKU, product, or category"
            className="rounded-lg border border-[#e7e4dc] bg-white px-3 py-2 text-sm text-[#111827]"
          />
          <Link
            href="/cart"
            className="rounded-lg border border-[#d6d3cc] px-4 py-2 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
          >
            View cart
          </Link>
        </div>

        <div className="hidden overflow-x-auto rounded-lg border border-[#e7e4dc] md:block">
          <table className="w-full text-sm">
            <thead className="bg-[#fcfbf9] text-xs uppercase tracking-wide text-[#6b7280]">
              <tr>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Unit</th>
                <th className="px-3 py-2 text-right">Case</th>
                <th className="px-3 py-2 text-right">Margin</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7e4dc] bg-white">
              {filtered.map((product) => {
                const quantity = quantities[product.id] || 0;
                const normalizedQuantity = nextValidQuantity(quantity, product);
                return (
                  <tr key={product.id} className="hover:bg-[#fcfbf9]">
                    <td className="px-3 py-3 font-mono text-xs text-[#4b5563]">{product.sku || "-"}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-[#111827]">{product.title}</p>
                      <p className="text-xs text-[#6b7280]">
                        MOQ {product.moq} · Pack {product.casePack}
                        {product.isBestSeller ? " · Best seller" : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-[#1d4b43]">
                      ${product.wholesalePrice.toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-[#374151]">
                      ${(product.wholesalePrice * product.casePack).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-right text-[#374151]">
                      {marginPercent(product) == null ? "-" : `${marginPercent(product)}%`}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="number"
                        min={0}
                        step={product.casePack}
                        value={quantity || ""}
                        onChange={(event) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: Number(event.target.value) || 0,
                          }))
                        }
                        onBlur={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: normalizedQuantity,
                          }))
                        }
                        className="w-24 rounded border border-[#d6d3cc] px-2 py-1 text-right"
                      />
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-[#111827]">
                      ${(product.wholesalePrice * normalizedQuantity).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {filtered.map((product) => {
            const quantity = quantities[product.id] || 0;
            const normalizedQuantity = nextValidQuantity(quantity, product);
            return (
              <div key={product.id} className="rounded-lg border border-[#e7e4dc] bg-white p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#111827]">{product.title}</p>
                    <p className="text-xs text-[#6b7280]">SKU: {product.sku || "-"}</p>
                  </div>
                  <p className="font-semibold text-[#1d4b43]">${product.wholesalePrice.toFixed(2)}</p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-[#4b5563]">
                  <p>MOQ {product.moq}</p>
                  <p>Pack {product.casePack}</p>
                  <p>{marginPercent(product) == null ? "Margin -" : `${marginPercent(product)}% margin`}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min={0}
                    step={product.casePack}
                    value={quantity || ""}
                    onChange={(event) =>
                      setQuantities((prev) => ({ ...prev, [product.id]: Number(event.target.value) || 0 }))
                    }
                    onBlur={() => setQuantities((prev) => ({ ...prev, [product.id]: normalizedQuantity }))}
                    className="w-28 rounded border border-[#d6d3cc] px-2 py-2 text-right text-sm"
                    placeholder="Qty"
                  />
                  <p className="text-sm font-semibold text-[#111827]">
                    ${(product.wholesalePrice * normalizedQuantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sticky bottom-3 flex flex-col gap-3 rounded-xl border border-[#e7e4dc] bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#4b5563]">
            <span className="font-semibold text-[#111827]">{selected.length}</span> SKUs selected ·{" "}
            <span className="font-semibold text-[#111827]">${selectedTotal.toFixed(2)}</span>
          </p>
          <button
            onClick={addSelectedToCart}
            disabled={selected.length === 0 || submitting}
            className="rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Selected to Cart"}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
