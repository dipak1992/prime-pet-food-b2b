"use client";

import { FormEvent, useEffect, useState } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

type Setting = { key: string; value: string; updatedAt: string };

type ProvisioningForm = {
  email: string;
  name: string;
  password?: string;
  mustChangePassword: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ key: "", value: "" });
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
