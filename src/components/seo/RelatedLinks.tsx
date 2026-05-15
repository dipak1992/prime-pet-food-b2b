import Link from "next/link";

interface RelatedLink {
  label: string;
  href: string;
}

interface RelatedLinksProps {
  links: RelatedLink[];
  heading?: string;
}

export default function RelatedLinks({ links, heading = "Related resources" }: RelatedLinksProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-[#111827]">{heading}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center rounded-xl border border-[#e7e4dc] bg-white px-4 py-2 text-sm font-medium text-[#1d4b43] hover:border-[#1d4b43]/30 hover:bg-[#eef6f3]"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
