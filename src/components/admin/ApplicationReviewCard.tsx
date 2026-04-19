"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApplicationCardProps = {
  application: {
    id: string;
    businessName: string;
    contactName: string;
    email: string;
    phone: string | null;
    businessType: string;
    city: string;
    state: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    notes: string | null;
    adminNotes: string | null;
  };
};

export function ApplicationReviewCard({ application }: ApplicationCardProps) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState(application.adminNotes ?? "");
  const [loadingAction, setLoadingAction] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: "approve" | "reject") {
    setError(null);
    setLoadingAction(action);

    try {
      const response = await fetch(`/api/admin/applications/${application.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || `Failed to ${action} application.`);
      }

      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
    } finally {
      setLoadingAction(null);
    }
  }

  const statusColor =
    application.status === "APPROVED"
      ? "text-green-700 bg-green-50 border-green-200"
      : application.status === "REJECTED"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-amber-700 bg-amber-50 border-amber-200";

  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#111827]">{application.businessName}</p>
          <p className="text-sm text-[#6b7280]">{application.contactName} • {application.email}</p>
          <p className="text-xs text-[#6b7280] mt-1">
            {application.businessType} • {application.city}, {application.state}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${statusColor}`}>
          {application.status}
        </span>
      </div>

      {application.notes ? (
        <p className="mt-3 rounded-lg bg-[#f8f7f4] px-3 py-2 text-sm text-[#4b5563]">{application.notes}</p>
      ) : null}

      <div className="mt-3">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b7280]">Admin notes</label>
        <textarea
          rows={3}
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#1d4b43]"
          placeholder="Add notes about this decision"
        />
      </div>

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => runAction("approve")}
          disabled={loadingAction !== null}
          className="rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loadingAction === "approve" ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={() => runAction("reject")}
          disabled={loadingAction !== null}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
        >
          {loadingAction === "reject" ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </article>
  );
}
