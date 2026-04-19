import { SectionCard } from "@/components/ui/SectionCard";

export default function SupportPage() {
  return (
    <SectionCard title="Support center" description="Request samples, custom pricing, or sales help.">
      <div className="grid gap-3 sm:grid-cols-3 text-sm">
        <button className="rounded-xl border border-[#d6d3cc] bg-white px-4 py-3 text-left">Request sample pack</button>
        <button className="rounded-xl border border-[#d6d3cc] bg-white px-4 py-3 text-left">Request custom pricing</button>
        <button className="rounded-xl border border-[#d6d3cc] bg-white px-4 py-3 text-left">Message sales rep</button>
      </div>
    </SectionCard>
  );
}
