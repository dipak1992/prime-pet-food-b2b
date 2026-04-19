import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import {
  computeCartSubtotal,
  deriveShippingTotal,
  getOrCreateActiveCart,
  validatePackConstraints,
} from "@/lib/services/cart";
import { checkoutInputSchema } from "@/lib/validations/cart";

function createOrderNumber(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `W-${stamp}-${suffix}`;
}

function formatAddressBlock(label: string, address: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}) {
  const parts = [address.line1, address.line2, `${address.city}, ${address.state} ${address.zip}`, address.country]
    .filter(Boolean)
    .join(" | ");
  return `${label}: ${parts}`;
}

export async function POST(request: Request) {
  const profile = await requireApprovedBuyer();
  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = checkoutInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const shippingAddress = parsed.data.shippingAddress;
  const billingAddress = parsed.data.billingSameAsShipping
    ? parsed.data.shippingAddress
    : parsed.data.billingAddress;

  if (!billingAddress) {
    return NextResponse.json({ error: "Billing address is required." }, { status: 400 });
  }

  const cart = await getOrCreateActiveCart(profile.customerId);
  if (!cart.items.length) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  for (const item of cart.items) {
    const validation = validatePackConstraints(item.quantity, item.product.moq, item.product.casePack);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: `${item.product.title}: ${validation.message}`,
        },
        { status: 400 }
      );
    }
  }

  const customer = await prisma.customer.findUnique({ where: { id: profile.customerId } });
  if (!customer) {
    return NextResponse.json({ error: "Customer record missing." }, { status: 404 });
  }

  const subtotal = await computeCartSubtotal(cart.id);
  const shippingTotal = deriveShippingTotal(subtotal, Number(customer.freeShippingThreshold));
  const taxTotal = Number((subtotal * 0.08).toFixed(2));
  const grandTotal = Number((subtotal + shippingTotal + taxTotal).toFixed(2));

  const notesParts = [
    parsed.data.notes?.trim(),
    parsed.data.poNumber?.trim() ? `PO: ${parsed.data.poNumber.trim()}` : undefined,
    formatAddressBlock("Shipping", shippingAddress),
    formatAddressBlock("Billing", billingAddress),
  ].filter(Boolean);

  const mergedNotes = notesParts.join("\n");

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        customerId: profile.customerId!,
        status: "PENDING",
        paymentStatus: "UNPAID",
        subtotal,
        shippingTotal,
        taxTotal,
        grandTotal,
        notes: mergedNotes || null,
        placedByUserId: profile.userId,
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
      },
      include: { items: true },
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: { status: "CHECKED_OUT", notes: mergedNotes || null },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        status: "PENDING",
        note: "Order placed by buyer.",
        changedById: profile.userId,
      },
    });

    return createdOrder;
  });

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      grandTotal: Number(order.grandTotal),
    },
  });
}
