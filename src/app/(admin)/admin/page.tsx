import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [pendingApplications, openOrders, customers] = await Promise.all([
    prisma.wholesaleApplication.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"] } } }),
    prisma.customer.count(),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <SectionCard title="Pending approvals">
        <p className="text-3xl font-semibold">{pendingApplications}</p>
      </SectionCard>
      <SectionCard title="Active orders">
        <p className="text-3xl font-semibold">{openOrders}</p>
      </SectionCard>
      <SectionCard title="Total customers">
        <p className="text-3xl font-semibold">{customers}</p>
      </SectionCard>
    </div>
  );
}
