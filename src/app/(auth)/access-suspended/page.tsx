import Link from "next/link";

export default function AccessSuspendedPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-orange-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1d4b43]">Prime Pet Food Wholesale</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">Account suspended</h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Your wholesale account is currently suspended. Pricing and ordering access will remain unavailable until the account is reactivated.
        </p>
        <p className="mt-3 text-sm text-[#6b7280]">
          Support: <a href="mailto:support@primepetfood.com" className="font-medium text-[#1d4b43] underline">support@primepetfood.com</a>
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse our catalog
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f2937]"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
