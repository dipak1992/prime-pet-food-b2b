import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-[#e7e4dc] bg-white p-5", className)}>
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#6b7280]">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
