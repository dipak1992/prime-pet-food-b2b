"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface Product {
  id: string;
  title: string;
  sku: string;
  description?: string;
  wholesalePrice: number;
  msrp?: number;
  moq: number;
  casePack: number;
  isActive: boolean;
}

interface ProductsResponse {
  products: Product[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [addingProductId, setAddingProductId] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data: ProductsResponse = await res.json();
      setProducts(data.products.sort((a, b) => a.title.localeCompare(b.title)));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleAddToCart(product: Product) {
    setAddingProductId(product.id);
    setSuccessMessage("");
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: product.moq,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add to cart");
      }

      setSuccessMessage(`${product.title} added to cart!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding to cart");
    } finally {
      setAddingProductId("");
    }
  }

  if (loading) {
    return (
      <SectionCard
        title="Wholesale catalog"
        description="Case-pack aware ordering for approved buyers."
      >
        <p className="text-sm text-[#4b5563]">Loading products...</p>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard
        title="Wholesale catalog"
        description="Case-pack aware ordering for approved buyers."
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Wholesale catalog"
      description="Case-pack aware ordering for approved buyers."
    >
      <div className="space-y-4">
        {/* Success Message */}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#4b5563] mb-4">No products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 flex flex-col hover:border-[#1d4b43] hover:shadow-sm transition-all"
              >
                {/* Product Header */}
                <div className="flex-1 mb-4">
                  <h3 className="font-semibold text-[#111827] text-sm mb-1 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-[#4b5563] mb-3">SKU: {product.sku}</p>

                  {/* Description */}
                  {product.description && (
                    <p className="text-xs text-[#4b5563] mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="mb-3 pb-3 border-b border-[#e7e4dc]">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-lg text-[#1d4b43]">
                        ${product.wholesalePrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#4b5563]">wholesale</span>
                    </div>
                    {product.msrp && (
                      <p className="text-xs text-[#4b5563]">
                        MSRP: ${product.msrp.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Constraints */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[#4b5563]">
                      <span>Minimum Order:</span>
                      <span className="font-medium">{product.moq} units</span>
                    </div>
                    <div className="flex justify-between text-[#4b5563]">
                      <span>Case Pack:</span>
                      <span className="font-medium">{product.casePack} units</span>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingProductId === product.id}
                  className="w-full rounded-lg bg-[#1d4b43] text-white text-sm font-semibold py-2 hover:bg-[#163836] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addingProductId === product.id
                    ? "Adding..."
                    : `Add ${product.moq} to Cart`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-[#e7e4dc]">
          <Link
            href="/cart"
            className="flex-1 rounded-lg border border-[#e7e4dc] px-4 py-2 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
          >
            View Cart
          </Link>
          <Link
            href="/downloads"
            className="flex-1 rounded-lg border border-[#e7e4dc] px-4 py-2 text-center text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
          >
            Pricing Sheet
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
