import Link from "next/link";

export default function AccessPendingPage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#1d4b43]">Prime Pet Food Wholesale</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111827]">Application under review</h1>
        <p className="mt-3 text-sm text-[#6b7280]">
          Thanks for applying. Your wholesale account is currently under review, and we will email you as soon as a decision is made.
        </p>
        <p className="mt-3 text-sm text-[#6b7280]">
          You can still browse the public catalog while pricing and ordering remain locked until approval.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Check my dashboard
          </Link>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-2.5 text-sm font-semibold text-[#1f2937]"
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
