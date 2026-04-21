import Link from "next/link";

export function ApprovalPendingNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Your application is under review</p>
          <p className="mt-0.5 text-sm text-amber-700">
            We&apos;ll notify you by email once your wholesale access is approved. Browse our catalog
            below while you wait.
          </p>
        </div>
      </div>
    </div>
  );
}

export function ApprovalPendingCartButton() {
  return (
    <button
      disabled
      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-700"
    >
      Pending approval — ordering not yet available
    </button>
  );
}

export function ApprovalPendingPriceCard() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-3 py-2">
      <svg
        className="h-4 w-4 shrink-0 text-amber-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-sm text-amber-700">Wholesale pricing available after approval</span>
    </div>
  );
}

export function ApprovalPendingBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-amber-800">
          <span className="font-semibold">Application under review.</span>{" "}
          You&apos;ll receive an email once your wholesale account is approved.{" "}
          <Link href="/dashboard" className="underline hover:opacity-80">
            Go to your dashboard →
          </Link>
        </p>
      </div>
    </div>
  );
}
