"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SectionCard } from "@/components/ui/SectionCard";

interface Product {
  id: string;
  title: string;
  sku: string;
  imageUrl?: string | null;
  category?: string | null;
  stockStatus?: string;
  isBestSeller?: boolean;
  description?: string;
  wholesalePrice: number;
  msrp?: number | null;
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
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "price_asc" | "price_desc">("title");

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data: ProductsResponse = await res.json();
      setProducts(data.products);
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

  const filteredProducts = products
    .filter((product) => {
      const search = query.trim().toLowerCase();
      if (!search) return true;
      return (
        product.title.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        (product.description || "").toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.wholesalePrice - b.wholesalePrice;
      if (sortBy === "price_desc") return b.wholesalePrice - a.wholesalePrice;
      return a.title.localeCompare(b.title);
    });

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, SKU, or description"
            className="md:col-span-2 rounded-lg border border-[#e7e4dc] bg-white px-3 py-2 text-sm text-[#111827]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "title" | "price_asc" | "price_desc")}
            className="rounded-lg border border-[#e7e4dc] bg-white px-3 py-2 text-sm text-[#111827]"
          >
            <option value="title">Sort: Name A-Z</option>
            <option value="price_asc">Sort: Price low to high</option>
            <option value="price_desc">Sort: Price high to low</option>
          </select>
        </div>

        <p className="text-xs text-[#4b5563]">Showing {filteredProducts.length} products</p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#4b5563] mb-4">No products available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 flex flex-col hover:border-[#ea580c] hover:shadow-sm transition-all"
              >
                <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-white">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-xs text-[#9ca3af]">
                      Product image coming soon
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {product.isBestSeller && (
                      <span className="rounded-full bg-[#ea580c] px-2 py-0.5 text-xs font-semibold text-white">
                        Best seller
                      </span>
                    )}
                    {product.stockStatus === "LOW_STOCK" && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        Low stock
                      </span>
                    )}
                  </div>
                </div>

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
                      <span className="font-bold text-lg text-[#ea580c]">
                        ${product.wholesalePrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#4b5563]">wholesale</span>
                    </div>
                    {product.msrp && (
                      <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-[#4b5563]">
                        <p>MSRP: ${product.msrp.toFixed(2)}</p>
                        <p className="text-right font-medium text-green-700">
                          {Math.round(((product.msrp - product.wholesalePrice) / product.msrp) * 100)}% margin
                        </p>
                      </div>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-white p-2 text-xs text-[#4b5563]">
                      <p>
                        Case cost:{" "}
                        <span className="font-semibold text-[#111827]">
                          ${(product.wholesalePrice * product.casePack).toFixed(2)}
                        </span>
                      </p>
                      {product.msrp ? (
                        <p className="text-right">
                          Case MSRP:{" "}
                          <span className="font-semibold text-[#111827]">
                            ${(product.msrp * product.casePack).toFixed(2)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-right">Case MSRP: -</p>
                      )}
                      {product.msrp ? (
                        <p className="col-span-2 text-green-700">
                          Gross profit per case: ${(product.msrp * product.casePack - product.wholesalePrice * product.casePack).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
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
                  className="w-full rounded-lg bg-[#ea580c] text-white text-sm font-semibold py-2 hover:bg-[#c2410c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
