import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: { include: { user: { select: { email: true, name: true } } } },
      items: { include: { product: { select: { title: true, imageUrl: true, sku: true } } } },
      invoice: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    order: {
      ...order,
      subtotal: Number(order.subtotal),
      shippingTotal: Number(order.shippingTotal),
      taxTotal: Number(order.taxTotal),
      discountTotal: Number(order.discountTotal),
      grandTotal: Number(order.grandTotal),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      invoice: order.invoice
        ? { ...order.invoice, amount: Number(order.invoice.amount) }
        : null,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { status, paymentStatus, trackingNumber, trackingUrl, notes } = body;

  const currentOrder = await prisma.order.findUnique({ where: { id } });
  if (!currentOrder) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(trackingUrl !== undefined && { trackingUrl }),
      ...(notes !== undefined && { notes }),
    },
  });

  if (status && status !== currentOrder.status) {
    await prisma.orderStatusHistory.create({
      data: { orderId: id, status, note: `Status updated to ${status}` },
    });
  }

  return NextResponse.json({ order: { ...updated, grandTotal: Number(updated.grandTotal) } });
}
