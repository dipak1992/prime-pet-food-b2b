import { SectionCard } from "@/components/ui/SectionCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <SectionCard title="Good morning" description="Ready to restock your best sellers?">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Last order", "22 days ago"],
            ["Total orders", "18"],
            ["Active orders", "2"],
            ["Top product", "Yak Cheese Medium"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">
              <p className="text-xs uppercase tracking-wide text-[#6b7280]">{label}</p>
              <p className="mt-1 text-base font-semibold text-[#111827]">{value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Quick actions">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Browse products",
            "Reorder last order",
            "Track orders",
            "Download invoices",
          ].map((item) => (
            <button
              key={item}
              className="rounded-xl border border-[#d6d3cc] bg-white px-4 py-3 text-left text-sm font-medium text-[#1f2937]"
            >
              {item}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Reorder alert" description="You last ordered 28 days ago. You may be due for a restock.">
        <p className="text-sm text-[#4b5563]">One-click reorder and quantity adjustments will be shown here after first order sync.</p>
      </SectionCard>
    </div>
  );
}
