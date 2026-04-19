"use client";

import { FormEvent, useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type Asset = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  visibility: string;
  createdAt: string;
};

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", type: "", fileUrl: "", visibility: "APPROVED_BUYERS" });

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    const res = await fetch("/api/admin/assets");
    const data = await res.json();
    setAssets(data.assets || []);
    setLoading(false);
  }

  async function addAsset(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    setForm({ title: "", type: "", fileUrl: "", visibility: "APPROVED_BUYERS" });
    await fetchAssets();
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Upload Asset" description="Create a marketing/document asset entry.">
        <form onSubmit={addAsset} className="grid gap-3 md:grid-cols-4">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <input
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            placeholder="Type (PDF, IMAGE, VIDEO)"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <input
            value={form.fileUrl}
            onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
            placeholder="File URL"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <select
            value={form.visibility}
            onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value }))}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
          >
            <option value="APPROVED_BUYERS">APPROVED_BUYERS</option>
            <option value="ALL">ALL</option>
          </select>
          <button
            type="submit"
            className="md:col-span-4 rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Save Asset
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Asset Library" description="Manage downloadable collateral.">
        {loading ? (
          <p className="text-sm text-[#4b5563]">Loading assets...</p>
        ) : assets.length === 0 ? (
          <p className="text-sm text-[#4b5563]">No assets created yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-4 hover:bg-[#f7f7fb]"
              >
                <p className="font-semibold text-[#111827]">{asset.title}</p>
                <p className="text-xs text-[#6b7280]">{asset.type}</p>
                <p className="mt-2 text-xs text-[#4b5563]">Visibility: {asset.visibility}</p>
              </a>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
