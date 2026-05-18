"use client";

import { FormEvent, useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type Setting = { key: string; value: string; updatedAt: string };
type SlaRule = {
  id: string;
  workflow: string;
  requestType: string | null;
  priority: string | null;
  hours: number;
  isActive: boolean;
};

type ProvisioningForm = {
  email: string;
  name: string;
  password?: string;
  mustChangePassword: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [slaRules, setSlaRules] = useState<SlaRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: "", value: "" });
  const [slaForm, setSlaForm] = useState({
    workflow: "QUOTE_REQUEST",
    requestType: "CUSTOM_PRICING",
    hours: "24",
  });
  const [integrationForm, setIntegrationForm] = useState({
    quickbooksCompanyId: "",
    quickbooksInvoicePrefix: "PPF-",
    achBankName: "",
    achRoutingLast4: "",
    achRemittanceEmail: "",
    achInstructions: "ACH preferred. Please include the invoice number in the payment memo.",
  });
  const [provisioningForm, setProvisioningForm] = useState<ProvisioningForm>({
    email: "",
    name: "",
    password: "",
    mustChangePassword: false,
  });
  const [provisioning, setProvisioning] = useState(false);
  const [provisioningMessage, setProvisioningMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchSettings();
    fetchSlaRules();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    const nextSettings = data.settings || [];
    setSettings(nextSettings);
    const settingValue = (key: string, fallback = "") =>
      nextSettings.find((setting: Setting) => setting.key === key)?.value || fallback;
    setIntegrationForm({
      quickbooksCompanyId: settingValue("quickbooks.companyId"),
      quickbooksInvoicePrefix: settingValue("quickbooks.invoicePrefix", "PPF-"),
      achBankName: settingValue("ach.bankName"),
      achRoutingLast4: settingValue("ach.routingLast4"),
      achRemittanceEmail: settingValue("ach.remittanceEmail"),
      achInstructions: settingValue(
        "ach.instructions",
        "ACH preferred. Please include the invoice number in the payment memo."
      ),
    });
    setLoading(false);
  }

  async function fetchSlaRules() {
    const res = await fetch("/api/admin/sla-rules");
    if (!res.ok) return;
    const data = await res.json();
    setSlaRules(data.rules || []);
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

  async function saveIntegrationSettings(e: FormEvent) {
    e.preventDefault();
    const settingsToSave = [
      ["quickbooks.companyId", integrationForm.quickbooksCompanyId],
      ["quickbooks.invoicePrefix", integrationForm.quickbooksInvoicePrefix],
      ["ach.bankName", integrationForm.achBankName],
      ["ach.routingLast4", integrationForm.achRoutingLast4],
      ["ach.remittanceEmail", integrationForm.achRemittanceEmail],
      ["ach.instructions", integrationForm.achInstructions],
    ];

    await Promise.all(
      settingsToSave.map(([key, value]) =>
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value }),
        })
      )
    );
    await fetchSettings();
  }

  async function saveSlaRule(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/sla-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflow: slaForm.workflow,
        requestType: slaForm.requestType || null,
        hours: Number(slaForm.hours),
      }),
    });
    if (res.ok) {
      setSlaForm({ workflow: "QUOTE_REQUEST", requestType: "CUSTOM_PRICING", hours: "24" });
      await fetchSlaRules();
    }
  }

  async function updateSlaRule(id: string, patch: Partial<SlaRule>) {
    const res = await fetch("/api/admin/sla-rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) await fetchSlaRules();
  }

  async function provisionAdminUser(e: FormEvent) {
    e.preventDefault();
    setProvisioning(true);
    setProvisioningMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/users/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: provisioningForm.email,
          name: provisioningForm.name,
          password: provisioningForm.password || undefined,
          mustChangePassword: provisioningForm.mustChangePassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProvisioningMessage({
          type: "success",
          text: `Admin user "${data.user.name}" (${data.user.email}) provisioned successfully.`,
        });
        setProvisioningForm({ email: "", name: "", password: "", mustChangePassword: false });
      } else {
        const error = await res.json();
        setProvisioningMessage({
          type: "error",
          text: error.error || "Failed to provision admin user.",
        });
      }
    } catch (err) {
      setProvisioningMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred.",
      });
    } finally {
      setProvisioning(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Provision Admin User" description="Create a new admin user account in Supabase Auth and set their app role.">
        <form onSubmit={provisionAdminUser} className="space-y-4">
          {provisioningMessage.text && (
            <div
              className={`rounded px-4 py-3 text-sm font-medium ${
                provisioningMessage.type === "success"
                  ? "border border-green-200 bg-green-50 text-green-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {provisioningMessage.text}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={provisioningForm.email}
                onChange={(e) =>
                  setProvisioningForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="admin@example.com"
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
                required
                disabled={provisioning}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={provisioningForm.name}
                onChange={(e) =>
                  setProvisioningForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="John Doe"
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
                required
                disabled={provisioning}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">
                Password <span className="text-xs text-[#6b7280]">(optional)</span>
              </label>
              <input
                type="password"
                value={provisioningForm.password}
                onChange={(e) =>
                  setProvisioningForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder="Leave blank to let user set password"
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
                disabled={provisioning}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={provisioningForm.mustChangePassword}
                  onChange={(e) =>
                    setProvisioningForm((f) => ({
                      ...f,
                      mustChangePassword: e.target.checked,
                    }))
                  }
                  disabled={provisioning}
                  className="h-4 w-4 rounded border-[#e7e4dc]"
                />
                <span className="text-sm text-[#2c2c2c]">Require password change on first login</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={provisioning}
            className="rounded bg-[#1d4b43] px-6 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-60"
          >
            {provisioning ? "Provisioning..." : "Provision Admin User"}
          </button>
        </form>
      </SectionCard>

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

      <SectionCard title="SLA Rules" description="Configure due dates for applications, quotes, invoices, tracking, and collections.">
        <div className="space-y-4">
          <form onSubmit={saveSlaRule} className="grid gap-3 md:grid-cols-4">
            <input
              value={slaForm.workflow}
              onChange={(e) => setSlaForm((f) => ({ ...f, workflow: e.target.value }))}
              placeholder="QUOTE_REQUEST"
              className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              required
            />
            <input
              value={slaForm.requestType}
              onChange={(e) => setSlaForm((f) => ({ ...f, requestType: e.target.value }))}
              placeholder="CUSTOM_PRICING"
              className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={1}
              value={slaForm.hours}
              onChange={(e) => setSlaForm((f) => ({ ...f, hours: e.target.value }))}
              placeholder="24"
              className="rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
            >
              Add SLA Rule
            </button>
          </form>

          <div className="overflow-x-auto rounded-lg border border-[#e7e4dc]">
            <table className="w-full text-sm">
              <thead className="bg-[#fcfbf9] text-xs uppercase tracking-wide text-[#6b7280]">
                <tr>
                  <th className="px-3 py-2 text-left">Workflow</th>
                  <th className="px-3 py-2 text-left">Request type</th>
                  <th className="px-3 py-2 text-right">Hours</th>
                  <th className="px-3 py-2 text-right">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc] bg-white">
                {slaRules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-3 py-2 font-semibold text-[#111827]">{rule.workflow}</td>
                    <td className="px-3 py-2 text-[#4b5563]">{rule.requestType || "Any"}</td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="number"
                        min={1}
                        value={rule.hours}
                        onChange={(e) => updateSlaRule(rule.id, { hours: Number(e.target.value) })}
                        className="w-20 rounded border border-[#e7e4dc] px-2 py-1 text-right"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={(e) => updateSlaRule(rule.id, { isActive: e.target.checked })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="QuickBooks & ACH Workflow" description="Export invoice payloads and standardize buyer payment instructions.">
        <form onSubmit={saveIntegrationSettings} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">QuickBooks company ID</label>
              <input
                value={integrationForm.quickbooksCompanyId}
                onChange={(e) =>
                  setIntegrationForm((f) => ({ ...f, quickbooksCompanyId: e.target.value }))
                }
                placeholder="913035..."
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Invoice export prefix</label>
              <input
                value={integrationForm.quickbooksInvoicePrefix}
                onChange={(e) =>
                  setIntegrationForm((f) => ({ ...f, quickbooksInvoicePrefix: e.target.value }))
                }
                placeholder="PPF-"
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">ACH bank name</label>
              <input
                value={integrationForm.achBankName}
                onChange={(e) => setIntegrationForm((f) => ({ ...f, achBankName: e.target.value }))}
                placeholder="Bank name shown to admins"
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Routing last 4</label>
              <input
                value={integrationForm.achRoutingLast4}
                onChange={(e) =>
                  setIntegrationForm((f) => ({ ...f, achRoutingLast4: e.target.value }))
                }
                placeholder="1234"
                maxLength={4}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">Remittance email</label>
              <input
                type="email"
                value={integrationForm.achRemittanceEmail}
                onChange={(e) =>
                  setIntegrationForm((f) => ({ ...f, achRemittanceEmail: e.target.value }))
                }
                placeholder="ap@theprimepetfood.com"
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2c2c2c] mb-1">ACH invoice instructions</label>
              <textarea
                value={integrationForm.achInstructions}
                onChange={(e) =>
                  setIntegrationForm((f) => ({ ...f, achInstructions: e.target.value }))
                }
                rows={3}
                className="w-full rounded border border-[#e7e4dc] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Save workflow settings
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
