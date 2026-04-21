import Link from "next/link";

export function GatedCartButton() {
  return (
    <Link
      href="/apply"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1d4b43] px-4 py-2.5 text-sm font-semibold text-[#1d4b43] hover:bg-[#f0f7f5] transition-colors"
    >
      <svg
        className="h-4 w-4 shrink-0"
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
      Apply to place orders
    </Link>
  );
}
