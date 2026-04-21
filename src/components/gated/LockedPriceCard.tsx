import Link from "next/link";

export function LockedPriceCard() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] px-3 py-2">
      <svg
        className="h-4 w-4 shrink-0 text-[#9ca3af]"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
        />
      </svg>
      <span className="text-sm text-[#6b7280]">
        <Link href="/apply" className="font-semibold text-[#1d4b43] hover:underline">
          Apply for wholesale access
        </Link>{" "}
        to see pricing
      </span>
    </div>
  );
}
