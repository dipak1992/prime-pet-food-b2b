import Link from "next/link";

export function RejectedAccessNotice() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-red-800">Wholesale access not approved</p>
          <p className="mt-0.5 text-sm text-red-700">
            Your application was not approved at this time. Contact{" "}
            <a href="mailto:support@primepetfood.com" className="underline hover:opacity-80">
              support@primepetfood.com
            </a>{" "}
            if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RejectedAccessBanner() {
  return (
    <div className="border-b border-red-200 bg-red-50 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-red-800">
          <span className="font-semibold">Access not approved.</span>{" "}
          <Link href="/access-rejected" className="underline hover:opacity-80">
            Learn more →
          </Link>
        </p>
      </div>
    </div>
  );
}
