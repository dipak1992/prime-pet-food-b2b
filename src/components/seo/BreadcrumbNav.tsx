import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol
        className="flex flex-wrap items-center gap-1 text-xs text-[#6b7280]"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-1"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {index > 0 && <span className="text-[#c7c2b5]">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-[#1d4b43] hover:underline"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span className="font-medium text-[#374151]" itemProp="name">
                {item.label}
              </span>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
