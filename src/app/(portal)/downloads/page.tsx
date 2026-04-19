import { SectionCard } from "@/components/ui/SectionCard";

export default function DownloadsPage() {
  return (
    <SectionCard title="Download center" description="Approved buyers can access sell sheets and assets.">
      <ul className="space-y-2 text-sm text-[#374151]">
        <li className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">Product sell sheet pack</li>
        <li className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">Brand logos and shelf images</li>
      </ul>
    </SectionCard>
  );
}
