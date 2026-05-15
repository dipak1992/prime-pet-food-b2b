import Link from "next/link";

interface CTABlockProps {
  heading: string;
  subheading?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  variant?: "dark" | "light" | "green";
}

export default function CTABlock({
  heading,
  subheading,
  primary,
  secondary,
  variant = "green",
}: CTABlockProps) {
  const wrapperClass = {
    dark: "rounded-2xl bg-[#111827] px-6 py-10 text-white",
    light: "rounded-2xl border border-[#e7e4dc] bg-white px-6 py-10",
    green: "rounded-2xl border border-[#1d4b43]/20 bg-[#eef6f3] px-6 py-10",
  }[variant];

  const headingClass = {
    dark: "text-white",
    light: "text-[#111827]",
    green: "text-[#111827]",
  }[variant];

  const subClass = {
    dark: "text-[#9ca3af]",
    light: "text-[#4b5563]",
    green: "text-[#4b5563]",
  }[variant];

  return (
    <section className={wrapperClass}>
      <h2 className={`text-2xl font-semibold tracking-tight ${headingClass}`}>{heading}</h2>
      {subheading && (
        <p className={`mt-3 max-w-2xl text-sm leading-6 ${subClass}`}>{subheading}</p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primary.href}
          className="inline-flex items-center justify-center rounded-xl bg-[#1d4b43] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163d36]"
        >
          {primary.label}
        </Link>
        {secondary && (
          <Link
            href={secondary.href}
            className="inline-flex items-center justify-center rounded-xl border border-[#c7c2b5] bg-white px-5 py-3 text-sm font-semibold text-[#1f2937] hover:bg-[#fcfbf9]"
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </section>
  );
}
