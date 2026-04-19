import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { SectionCard } from "@/components/ui/SectionCard";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await requireApprovedBuyer();
  const { id } = await params;

  if (!profile.customerId) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: { id, customerId: profile.customerId },
    include: { items: true, invoice: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <SectionCard title={`Order ${order.orderNumber}`} description="Track shipment and invoice details.">
      <div className="space-y-2 text-sm text-[#374151]">
        <p>Status: {order.status}</p>
        <p>Payment: {order.paymentStatus}</p>
        <p>Total: ${Number(order.grandTotal).toFixed(2)}</p>
        <p>Tracking #: {order.trackingNumber || "Not assigned"}</p>
      </div>
    </SectionCard>
  );
}
