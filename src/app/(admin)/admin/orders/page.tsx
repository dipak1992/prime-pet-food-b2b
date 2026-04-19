import { prisma } from "@/lib/prisma";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <SectionCard title="Order management" description="Update statuses, tracking, and invoices.">
      <div className="space-y-2 text-sm text-[#374151]">
        {orders.map((order) => (
          <div key={order.id} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
            {order.orderNumber} • {order.status} • ${Number(order.grandTotal).toFixed(2)}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
