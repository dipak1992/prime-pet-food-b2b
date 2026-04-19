"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { SectionCard } from "@/components/ui/SectionCard";

interface Product {
  id: string;
  title: string;
  sku: string;
  moq: number;
  casePack: number;
  wholesalePrice: number;
  msrp?: number;
  customerMargin?: number;
  customPrice?: number;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${params.id}`);
      if (!res.ok) throw new Error("Failed to load product");
      const data = await res.json();
      setProduct(data.product);
      setIsFavorite(data.isFavorite);
      setQuantity(data.product.moq);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading product");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavorite() {
    if (!product) return;
    try {
      const method = isFavorite ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!res.ok) throw new Error("Failed to update favorite");
      setIsFavorite(!isFavorite);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating favorite");
    }
  }

  async function handleAddToCart() {
    if (!product) return;
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add to cart");
      }
      alert("Added to cart!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error adding to cart");
    }
  }

  if (loading) {
    return (
      <SectionCard title="Product" description="Loading details...">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (!product) {
    notFound();
  }

  const marginPercentage = product.customerMargin || 0;
  const retailPrice = product.customPrice || product.msrp || (product.wholesalePrice * 1.5);
  const potentialMargin = retailPrice - product.wholesalePrice;

  return (
    <div className="space-y-4">
      <SectionCard title={product.title} description="Wholesale product details">
        <div className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Product Info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[#e7e4dc]">
            <div>
              <p className="text-xs text-[#4b5563] uppercase font-semibold mb-1">SKU</p>
              <p className="font-semibold text-[#111827]">{product.sku || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-[#4b5563] uppercase font-semibold mb-1">MOQ</p>
              <p className="font-semibold text-[#111827]">{product.moq} units</p>
            </div>
            <div>
              <p className="text-xs text-[#4b5563] uppercase font-semibold mb-1">Case Pack</p>
              <p className="font-semibold text-[#111827]">{product.casePack} units/case</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-3 pb-4 border-b border-[#e7e4dc]">
            <div>
              <p className="text-xs text-[#4b5563] uppercase font-semibold mb-1">Your Wholesale Price</p>
              <p className="text-2xl font-bold text-[#1d4b43]">
                ${product.wholesalePrice.toFixed(2)}
                <span className="text-xs text-[#4b5563] font-normal ml-2">per unit</span>
              </p>
            </div>

            {product.msrp && (
              <div>
                <p className="text-xs text-[#4b5563] uppercase font-semibold mb-1">MSRP</p>
                <p className="text-lg font-semibold text-[#111827]">${product.msrp.toFixed(2)}</p>
              </div>
            )}

            {/* Margin Display */}
            {marginPercentage > 0 && (
              <div className="rounded-lg bg-[#f5f3f0] p-3">
                <p className="text-xs text-[#4b5563] uppercase font-semibold mb-2">Your Potential Margin</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">{marginPercentage}%</span>
                  <span className="text-sm text-[#4b5563]">
                    (~${potentialMargin.toFixed(2)} per unit)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-2">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(product.moq, quantity - 1))}
                  className="px-3 py-2 rounded-lg border border-[#d1cec4] hover:bg-[#f5f3f0]"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                  className="w-16 px-3 py-2 rounded-lg border border-[#d1cec4] text-center"
                  min={product.moq}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 rounded-lg border border-[#d1cec4] hover:bg-[#f5f3f0]"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-[#4b5563] mt-1">
                Cases needed: {Math.ceil(quantity / product.casePack)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-lg bg-[#1d4b43] px-4 py-3 text-sm font-semibold text-white hover:bg-[#163836]"
              >
                Add to Cart
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`rounded-lg px-4 py-3 text-sm font-semibold border ${
                  isFavorite
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    : "border-[#d1cec4] text-[#111827] hover:bg-[#f5f3f0]"
                }`}
              >
                {isFavorite ? "♥" : "♡"} Favorite
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
