import { SectionCard } from "@/components/ui/SectionCard";

export default function OrdersPage() {
  return (
    <SectionCard title="Orders" description="Track every wholesale order in one place.">
      <div className="space-y-2 text-sm text-[#374151]">
        <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">#W-2026-1042 • Shipped • Tracking pending sync</div>
        <div className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">#W-2026-1028 • Delivered • Invoice available</div>
      </div>
    </SectionCard>
  );
}
