"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, Star } from "lucide-react";

type Address = {
  id: string;
  type: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
};

type UserData = {
  name: string | null;
  email: string;
  customer: {
    businessName: string | null;
    businessType: string | null;
    tier: string | null;
    addresses: Address[];
  } | null;
};

const emptyAddress = {
  type: "SHIPPING",
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  isDefault: false,
};

export default function AccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          const u = data.user as UserData;
          setUser(u);
          setName(u.name ?? "");
          setBusinessName(u.customer?.businessName ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessName }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (!newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update password";
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  }

  function openAddAddress() {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
  }

  function openEditAddress(addr: Address) {
    setEditingAddress(addr);
    setAddressForm({
      type: addr.type,
      label: addr.label ?? "",
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setShowAddressForm(true);
  }

  async function saveAddress() {
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.zip) {
      toast.error("Address, city, state, and ZIP are required");
      return;
    }
    setSavingAddress(true);
    try {
      const url = editingAddress
        ? `/api/me/addresses/${editingAddress.id}`
        : "/api/me/addresses";
      const method = editingAddress ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const saved = data.address as Address;
      setUser((prev) => {
        if (!prev?.customer) return prev;
        const addresses = editingAddress
          ? prev.customer.addresses.map((a) => (a.id === saved.id ? saved : a))
          : [...prev.customer.addresses, saved];
        const updated = addressForm.isDefault
          ? addresses.map((a) => ({ ...a, isDefault: a.id === saved.id }))
          : addresses;
        return { ...prev, customer: { ...prev.customer, addresses: updated } };
      });
      toast.success(editingAddress ? "Address updated" : "Address added");
      setShowAddressForm(false);
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/me/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setUser((prev) => {
        if (!prev?.customer) return prev;
        return {
          ...prev,
          customer: {
            ...prev.customer,
            addresses: prev.customer.addresses.filter((a) => a.id !== id),
          },
        };
      });
      toast.success("Address removed");
    } catch {
      toast.error("Failed to delete address");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1d4b43] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8 px-4 py-8 md:px-6">
      <h1 className="text-2xl font-bold text-[#111827]">Account Settings</h1>

      {/* Profile */}
      <section className="rounded-xl border border-[#e7e4dc] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-[#111827]">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Email</label>
            <input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="w-full rounded-lg border border-[#e7e4dc] bg-[#f9f8f5] px-3 py-2 text-sm text-[#9ca3af]"
            />
          </div>
          {user?.customer && (
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                placeholder="Your business name"
              />
            </div>
          )}
          {user?.customer?.tier && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#6b7280]">Account tier:</span>
              <span className="rounded-full bg-[#1d4b43]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1d4b43]">
                {user.customer.tier}
              </span>
            </div>
          )}
          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {savingProfile ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </section>

      {/* Password */}
      <section className="rounded-xl border border-[#e7e4dc] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-[#111827]">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
              placeholder="Repeat new password"
            />
          </div>
          <button
            onClick={savePassword}
            disabled={savingPassword || !newPassword}
            className="rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {savingPassword ? "Updating…" : "Update Password"}
          </button>
        </div>
      </section>

      {/* Addresses */}
      <section className="rounded-xl border border-[#e7e4dc] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#111827]">Saved Addresses</h2>
          <button
            onClick={openAddAddress}
            className="flex items-center gap-1.5 rounded-lg border border-[#1d4b43] px-3 py-1.5 text-xs font-medium text-[#1d4b43] hover:bg-[#1d4b43]/5"
          >
            <Plus className="size-3.5" />
            Add Address
          </button>
        </div>

        {user?.customer?.addresses.length === 0 && !showAddressForm && (
          <p className="text-sm text-[#6b7280]">No addresses saved yet.</p>
        )}

        <div className="space-y-3">
          {user?.customer?.addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-start justify-between rounded-lg border border-[#e7e4dc] p-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-[#6b7280]">{addr.type}</span>
                  {addr.label && <span className="text-xs text-[#9ca3af]">· {addr.label}</span>}
                  {addr.isDefault && (
                    <span className="flex items-center gap-0.5 text-[11px] font-medium text-[#1d4b43]">
                      <Star className="size-3 fill-[#1d4b43]" /> Default
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-[#374151]">
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}
                </p>
                <p className="text-sm text-[#374151]">
                  {addr.city}, {addr.state} {addr.zip}
                  {addr.country !== "US" ? `, ${addr.country}` : ""}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0 ml-3">
                <button
                  onClick={() => openEditAddress(addr)}
                  className="rounded p-1.5 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#374151]"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="rounded p-1.5 text-[#6b7280] hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Address form */}
        {showAddressForm && (
          <div className="mt-4 rounded-lg border border-[#1d4b43]/30 bg-[#f9f8f5] p-4">
            <h3 className="mb-3 text-sm font-semibold text-[#111827]">
              {editingAddress ? "Edit Address" : "New Address"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#374151]">Address Line 1 *</label>
                <input
                  type="text"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))}
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                  placeholder="123 Main St"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-[#374151]">Address Line 2</label>
                <input
                  type="text"
                  value={addressForm.line2}
                  onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))}
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                  placeholder="Suite, unit, etc."
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#374151]">City *</label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#374151]">State *</label>
                <input
                  type="text"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                  placeholder="CA"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#374151]">ZIP *</label>
                <input
                  type="text"
                  value={addressForm.zip}
                  onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))}
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                  placeholder="90001"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#374151]">Label</label>
                <input
                  type="text"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43] focus:ring-1 focus:ring-[#1d4b43]"
                  placeholder="Home, Warehouse…"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="h-4 w-4 accent-[#1d4b43]"
                />
                <label htmlFor="isDefault" className="text-sm text-[#374151]">
                  Set as default address
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={saveAddress}
                disabled={savingAddress}
                className="rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {savingAddress ? "Saving…" : editingAddress ? "Update" : "Add Address"}
              </button>
              <button
                onClick={() => setShowAddressForm(false)}
                className="rounded-lg border border-[#d1d5db] px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f3f4f6]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

