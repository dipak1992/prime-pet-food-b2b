"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [businessType, setBusinessType] = useState("pet_store");
  const [budget, setBudget] = useState("500");

  const fetchBundles = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBundles();
  }, [fetchBundles]);

  const starterRecommendation = useMemo(() => {
    const maxBudget = Number(budget);
    const affordable = bundles
      .filter((bundle) => bundle.bundlePrice <= maxBudget)
      .sort((a, b) => b.bundlePrice - a.bundlePrice);
    return affordable[0] || bundles[0] || null;
  }, [budget, bundles]);

  if (loading) {
    return (
      <SectionCard title="Bundles" description="Pre-built product bundles at special pricing.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  if (bundles.length === 0) {
    return (
      <SectionCard title="Starter assortment builder" description="Recommended case mixes for first wholesale orders.">
        <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
          <p className="text-sm font-semibold text-[#111827]">No saved bundles are available yet.</p>
          <p className="mt-2 text-sm text-[#4b5563]">
            Add bundles in admin to turn this into a guided starter-order builder by buyer type and budget.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Starter assortment builder" description="Pre-built case mixes for faster first orders and cleaner reorders.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="flex flex-col gap-1 text-sm font-semibold text-[#111827]">
              Buyer type
              <select
                value={businessType}
                onChange={(event) => setBusinessType(event.target.value)}
                className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
              >
                <option value="pet_store">Pet store</option>
                <option value="groomer">Groomer</option>
                <option value="daycare">Daycare / boarding</option>
                <option value="vet">Vet clinic</option>
                <option value="distributor">Distributor</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[#111827]">
              Starter budget
              <select
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="rounded-lg border border-[#d1cec4] bg-white px-3 py-2 text-sm"
              >
                <option value="250">Under $250</option>
                <option value="500">$250-$500</option>
                <option value="1000">$500-$1,000</option>
                <option value="2000">$1,000+</option>
              </select>
            </label>
            <div className="rounded-lg border border-[#dbeafe] bg-blue-50 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Recommended</p>
              <p className="mt-1 text-sm font-semibold text-blue-950">
                {starterRecommendation ? starterRecommendation.name : "No fit yet"}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#6b7280]">
            Recommendation uses current bundle price and budget. Buyer type is captured now so future assortments can be tuned by channel.
          </p>
        </div>

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
                    <p className="text-2xl font-bold text-[#ea580c]">
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

              <button className="w-full rounded-lg bg-[#ea580c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c2410c]">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
