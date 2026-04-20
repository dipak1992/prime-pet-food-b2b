import Link from "next/link";

export default function AccessPendingPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1d4b43]">Prime Pet Food Wholesale</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">Approval pending</h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Your buyer account exists, but access is pending approval. We will notify you when your wholesale access is approved.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
