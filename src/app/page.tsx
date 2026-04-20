import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#f9f2df_0%,#f8f7f4_45%,#eef6f3_100%)]">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <Image
          src="/logo.jpg"
          alt="Prime Pet Food Logo"
          width={120}
          height={120}
          className="mb-6 h-24 w-24 object-contain"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1d4b43]">Prime Pet Food</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#111827] sm:text-5xl">
          Premium wholesale ordering for Himalayan Yak Cheese chews.
        </h1>

        <div className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-3 text-sm font-semibold text-[#f8f7f4] shadow-sm"
          >
            Apply for wholesale
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937]"
          >
            Wholesale login
          </Link>
        </div>
      </main>

      <img
        src="/yak-cheese-chews.svg"
        alt="Yak cheese chews"
        className="pointer-events-none absolute bottom-4 right-4 hidden w-52 opacity-35 sm:block"
      />
    </div>
  );
}
