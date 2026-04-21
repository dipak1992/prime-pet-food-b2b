import Link from "next/link";

export function GatedBanner() {
  return (
    <div className="border-b border-[#d4e9e4] bg-[#f0f7f5] py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-[#1d4b43]">
          <span className="font-semibold">Wholesale pricing is members-only.</span>{" "}
          <Link href="/apply" className="underline font-semibold hover:opacity-80">
            Apply for access
          </Link>{" "}
          or{" "}
          <Link href="/login" className="underline hover:opacity-80">
            log in
          </Link>{" "}
          to see your prices and place orders.
        </p>
      </div>
    </div>
  );
}
