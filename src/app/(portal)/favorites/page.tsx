"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface Product {
  id: string;
  title: string;
  sku: string;
  wholesalePrice: number;
  msrp?: number;
  moq: number;
  casePack: number;
}

interface FavoritesResponse {
  favorites: Product[];
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [removingId, setRemovingId] = useState<string>("");

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      setLoading(true);
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to load favorites");
      const data: FavoritesResponse = await res.json();
      setFavorites(data.favorites);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading favorites");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(productId: string) {
    setRemovingId(productId);
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) throw new Error("Failed to remove favorite");
      await fetchFavorites();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing favorite");
    } finally {
      setRemovingId("");
    }
  }

  if (loading) {
    return (
      <SectionCard title="Favorites" description="Your saved products for quick reordering.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (favorites.length === 0) {
    return (
      <SectionCard title="Favorites" description="Your saved products for quick reordering.">
        <div className="text-center py-12">
          <p className="text-sm text-[#4b5563] mb-4">No favorites yet.</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Explore Products
          </Link>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Favorites" description="Your saved products for quick reordering.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 flex flex-col"
            >
              <div className="flex-1 mb-4">
                <h3 className="font-semibold text-[#111827] text-sm mb-1 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-xs text-[#4b5563] mb-3">SKU: {product.sku}</p>

                <div className="mb-3 pb-3 border-b border-[#e7e4dc]">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg text-[#1d4b43]">
                      ${product.wholesalePrice.toFixed(2)}
                    </span>
                    {product.msrp && (
                      <span className="text-xs text-[#4b5563]">MSRP: ${product.msrp.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#4b5563]">
                    <span>MOQ:</span>
                    <span className="font-medium">{product.moq}</span>
                  </div>
                  <div className="flex justify-between text-[#4b5563]">
                    <span>Case Pack:</span>
                    <span className="font-medium">{product.casePack}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={removingId === product.id}
                  className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {removingId === product.id ? "..." : "Remove"}
                </button>
                <Link
                  href={`/products/${product.id}`}
                  className="flex-1 rounded-lg bg-[#1d4b43] px-3 py-2 text-center text-sm font-semibold text-white hover:bg-[#163836]"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}