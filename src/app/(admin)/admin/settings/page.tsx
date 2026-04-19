"use client";

import { FormEvent, useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type Setting = { key: string; value: string; updatedAt: string };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: "", value: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setSettings(data.settings || []);
    setLoading(false);
  }

  async function saveSetting(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    setForm({ key: "", value: "" });
    await fetchSettings();
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Save Setting" description="Store a key/value setting for admin workflows.">
        <form onSubmit={saveSetting} className="grid gap-3 md:grid-cols-3">
          <input
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            placeholder="key"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <input
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder="value"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Save
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Current Settings" description="Current runtime key/value values.">
        {loading ? (
          <p className="text-sm text-[#4b5563]">Loading settings...</p>
        ) : settings.length === 0 ? (
          <p className="text-sm text-[#4b5563]">No settings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
                <tr>
                  <th className="px-3 py-2 text-left">Key</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc]">
                {settings.map((setting) => (
                  <tr key={setting.key} className="hover:bg-[#f7f7fb]">
                    <td className="px-3 py-3 font-medium">{setting.key}</td>
                    <td className="px-3 py-3 text-[#4b5563]">{setting.value}</td>
                    <td className="px-3 py-3 text-xs text-[#6b7280]">
                      {new Date(setting.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
