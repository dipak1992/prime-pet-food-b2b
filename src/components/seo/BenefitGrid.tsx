interface Benefit {
  title: string;
  description: string;
}

interface BenefitGridProps {
  heading: string;
  subheading?: string;
  benefits: Benefit[];
  columns?: 2 | 3 | 4;
  variant?: "default" | "green";
}

export default function BenefitGrid({
  heading,
  subheading,
  benefits,
  columns = 3,
  variant = "default",
}: BenefitGridProps) {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  const cardClass =
    variant === "green"
      ? "rounded-xl border border-[#1d4b43]/20 bg-[#eef6f3] p-5"
      : "rounded-xl border border-[#e7e4dc] bg-white p-5 shadow-sm";

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-[#111827]">{heading}</h2>
        {subheading && (
          <p className="mt-2 text-sm leading-6 text-[#4b5563]">{subheading}</p>
        )}
      </div>
      <div className={`grid gap-4 ${gridCols}`}>
        {benefits.map((benefit) => (
          <article key={benefit.title} className={cardClass}>
            <h3 className="text-sm font-semibold text-[#1d4b43]">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#4b5563]">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
