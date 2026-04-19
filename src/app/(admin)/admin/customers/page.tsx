import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 50,
  });

  return (
    <SectionCard title="Customer management" description="Manage tiers, status, and terms.">
      <div className="space-y-2 text-sm text-[#374151]">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
            {customer.businessName} • {customer.tier} • {customer.user.email}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
