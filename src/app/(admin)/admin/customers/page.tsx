"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionCard } from "@/components/ui/SectionCard";

interface Customer {
  id: string;
  businessName: string;
  businessType: string;
  tier: string;
  accountStatus: string;
  approvedAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    lastLoginAt: string | null;
  };
  addressCount: number;
  orderCount: number;
  totalSpent: number;
}

interface CustomersResponse {
  customers: Customer[];
}

const TIERS = ["BRONZE", "SILVER", "GOLD"];
const STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (!res.ok) throw new Error("Failed to load customers");
      const data: CustomersResponse = await res.json();
      setCustomers(data.customers);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading customers");
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesTier = !tierFilter || customer.tier === tierFilter;
    const matchesStatus = !statusFilter || customer.accountStatus === statusFilter;
    const matchesSearch =
      !searchTerm ||
      customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTier && matchesStatus && matchesSearch;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
    });
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      BRONZE: "bg-amber-100 text-amber-700",
      SILVER: "bg-gray-100 text-gray-700",
      GOLD: "bg-yellow-100 text-yellow-700",
    };
    return colors[tier] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      SUSPENDED: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <SectionCard title="Customer Management" description="Manage tiers, status, and terms.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Customer Management" description="Manage tiers, status, and terms.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
          <input
            type="text"
            placeholder="Search business, email, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#1d4b43] focus:outline-none"
          />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#1d4b43] focus:outline-none"
          >
            <option value="">All Tiers</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-[#e7e4dc] px-3 py-2 text-sm focus:border-[#1d4b43] focus:outline-none"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={fetchCustomers}
            className="rounded bg-[#1d4b43] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            Refresh
          </button>
        </div>

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-sm text-[#4b5563]">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#e7e4dc] bg-[#fcfbf9]">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Business</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Contact</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Type</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Tier</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Status</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#111827]">Orders</th>
                  <th className="px-4 py-2 text-right font-semibold text-[#111827]">Spent</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Joined</th>
                  <th className="px-4 py-2 text-left font-semibold text-[#111827]">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e7e4dc]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#fcfbf9]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-semibold text-[#1d4b43] hover:underline"
                      >
                        {customer.businessName}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-[#111827]">{customer.user.name}</div>
                      <div className="text-xs text-[#4b5563]">{customer.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4b5563]">{customer.businessType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getTierColor(
                          customer.tier
                        )}`}
                      >
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          customer.accountStatus
                        )}`}
                      >
                        {customer.accountStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#111827]">
                      {customer.orderCount}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#111827]">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4b5563]">
                      {formatDate(customer.approvedAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#4b5563]">
                      {formatDate(customer.user.lastLoginAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        <div className="border-t border-[#e7e4dc] pt-4 text-sm text-[#4b5563]">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </div>
    </SectionCard>
  );
}
