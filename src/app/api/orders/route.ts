import { NextRequest, NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: profile.customerId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: true, invoice: true },
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      ...order,
      grandTotal: Number(order.grandTotal),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();

    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const { notes } = await req.json();

    // Get active cart
    const cart = await prisma.cart.findFirst({
      where: {
        customerId: profile.customerId,
        status: "ACTIVE",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                title: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Generate order number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { orderNumber: true },
    });

    let nextOrderNumber = 1001;
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(/\d+$/);
      if (match) {
        nextOrderNumber = parseInt(match[0]) + 1;
      }
    }

    const orderNumber = `ORD-${nextOrderNumber}`;

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const shippingCost = subtotal >= 150 ? 0 : 24;
    const tax = Math.round((subtotal + shippingCost) * 0.1 * 100) / 100;
    const grandTotal = subtotal + shippingCost + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        customerId: profile.customerId,
        orderNumber,
        status: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productTitleSnapshot: item.product.title,
            skuSnapshot: item.product.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: Number(item.unitPrice) * item.quantity,
          })),
        },
        subtotal: subtotal,
        shippingTotal: shippingCost,
        taxTotal: tax,
        grandTotal: grandTotal,
        notes: notes || null,
      },
    });

    // Mark cart as checked out
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: "CHECKED_OUT" },
    });

    // Create invoice
    const invoiceNumber = `INV-${nextOrderNumber}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Net 30

    await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        amount: grandTotal,
        status: "SENT",
        dueDate,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        grandTotal: order.grandTotal,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
