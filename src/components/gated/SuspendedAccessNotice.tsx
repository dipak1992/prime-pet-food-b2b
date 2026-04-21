import Link from "next/link";

export function SuspendedAccessNotice() {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
      <div className="flex gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-orange-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-orange-800">Account suspended</p>
          <p className="mt-0.5 text-sm text-orange-700">
            Your wholesale account is currently suspended. Contact{" "}
            <a href="mailto:support@primepetfood.com" className="underline hover:opacity-80">
              support@primepetfood.com
            </a>{" "}
            to resolve this.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SuspendedAccessBanner() {
  return (
    <div className="border-b border-orange-200 bg-orange-50 py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-orange-800">
          <span className="font-semibold">Account suspended.</span>{" "}
          <Link href="/access-suspended" className="underline hover:opacity-80">
            Learn more →
          </Link>
        </p>
      </div>
    </div>
  );
}
