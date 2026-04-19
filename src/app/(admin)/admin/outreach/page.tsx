"use client";

import { FormEvent, useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type Lead = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "ARCHIVED"];

export default function AdminOutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ businessName: "", contactName: "", email: "", phone: "" });

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const res = await fetch("/api/admin/leads");
    const data = await res.json();
    setLeads(data.leads || []);
    setLoading(false);
  }

  async function addLead(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return;
    setForm({ businessName: "", contactName: "", email: "", phone: "" });
    await fetchLeads();
  }

  async function updateLead(id: string, status: string) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await fetchLeads();
  }

  return (
    <div className="space-y-6">
      <SectionCard title="New Lead" description="Add a lead manually to the outreach pipeline.">
        <form onSubmit={addLead} className="grid gap-3 md:grid-cols-4">
          <input
            value={form.businessName}
            onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
            placeholder="Business name"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <input
            value={form.contactName}
            onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            placeholder="Contact name"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            required
          />
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="Phone (optional)"
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="md:col-span-4 rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Add Lead
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Lead Pipeline" description="Track and update lead progression.">
        {loading ? (
          <p className="text-sm text-[#4b5563]">Loading leads...</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-[#4b5563]">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
                <tr>
                  <th className="px-3 py-2 text-left">Business</th>
                  <th className="px-3 py-2 text-left">Contact</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#f7f7fb]">
                    <td className="px-3 py-3">
                      <p className="font-medium">{lead.businessName}</p>
                      <p className="text-xs text-[#6b7280]">{lead.email}</p>
                    </td>
                    <td className="px-3 py-3 text-[#4b5563]">{lead.contactName}</td>
                    <td className="px-3 py-3 text-[#4b5563]">{lead.source}</td>
                    <td className="px-3 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLead(lead.id, e.target.value)}
                        className="rounded border border-[#e7e4dc] px-2 py-1 text-xs"
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#6b7280]">
                      {new Date(lead.createdAt).toLocaleDateString()}
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
