import { SectionCard } from "@/components/ui/SectionCard";

export default function InvoicesPage() {
  return (
    <SectionCard title="Invoices" description="View and download past invoice PDFs.">
      <ul className="space-y-2 text-sm text-[#374151]">
        <li className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">INV-1008 • $482.00 • Paid</li>
        <li className="rounded-xl border border-[#e7e4dc] bg-[#fcfbf9] p-3">INV-1014 • $920.00 • Due in 8 days</li>
      </ul>
    </SectionCard>
  );
}
