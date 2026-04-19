"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface BundleItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    sku: string;
  };
}

interface Bundle {
  id: string;
  name: string;
  description?: string;
  bundlePrice: number;
  items: BundleItem[];
  createdAt: string;
}

interface BundlesResponse {
  bundles: Bundle[];
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchBundles();
  }, []);

  async function fetchBundles() {
    try {
      setLoading(true);
      const res = await fetch("/api/bundles");
      if (!res.ok) throw new Error("Failed to load bundles");
      const data: BundlesResponse = await res.json();
      setBundles(data.bundles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading bundles");
    } finally {
      setLoading(false);
    }
  }

  const calculateSavings = (bundle: Bundle) => {
    // Calculate what items would cost individually
    let individualPrice = 0;
    bundle.items.forEach((item) => {
      // This would need actual product prices, for now just a placeholder
      individualPrice += 100 * item.quantity; // Placeholder
    });
    return Math.max(0, individualPrice - bundle.bundlePrice);
  };

  if (loading) {
    return (
      <SectionCard title="Bundles" description="Pre-built product bundles at special pricing.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (bundles.length === 0) {
    return (
      <SectionCard title="Bundles" description="Pre-built product bundles at special pricing.">
        <p className="text-center text-sm text-[#4b5563] py-8">No bundles available yet.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Bundles" description="Pre-built product bundles at special pricing.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 flex flex-col"
            >
              <div className="flex-1 mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-[#111827]">{bundle.name}</h3>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    Bundle
                  </span>
                </div>

                {bundle.description && (
                  <p className="text-sm text-[#4b5563] mb-3">{bundle.description}</p>
                )}

                <div className="mb-4 pb-4 border-b border-[#e7e4dc]">
                  <div className="mb-2">
                    <p className="text-xs text-[#4b5563] uppercase font-semibold mb-1">Bundle Price</p>
                    <p className="text-2xl font-bold text-[#1d4b43]">
                      ${bundle.bundlePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#4b5563] uppercase font-semibold mb-2">
                    {bundle.items.length} Item{bundle.items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2">
                    {bundle.items.slice(0, 3).map((item) => (
                      <div key={item.productId} className="text-sm">
                        <div className="flex justify-between text-[#111827]">
                          <span className="font-medium line-clamp-1">{item.product.title}</span>
                          <span className="text-[#4b5563]">x{item.quantity}</span>
                        </div>
                        <p className="text-xs text-[#4b5563]">SKU: {item.product.sku}</p>
                      </div>
                    ))}
                    {bundle.items.length > 3 && (
                      <p className="text-sm text-[#4b5563] italic">
                        +{bundle.items.length - 3} more item{bundle.items.length - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button className="w-full rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}