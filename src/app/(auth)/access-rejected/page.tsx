import Link from "next/link";

export default function AccessRejectedPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1d4b43]">Prime Pet Food Wholesale</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">Application not approved</h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Your wholesale application was not approved at this time. If you believe there was a mistake or your business details have changed, contact our team for a review.
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
