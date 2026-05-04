import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveCart } from "@/lib/services/cart";

/**
 * Reorder
 * Clones items from a selected order into the active cart.
 * Falls back to the customer's most recent order for the dashboard quick action.
 */
export async function POST(request: Request) {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as { orderId?: string };

  const sourceOrder = await prisma.order.findFirst({
    where: {
      customerId: profile.customerId,
      ...(body.orderId ? { id: body.orderId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (!sourceOrder) {
    return NextResponse.json(
      { error: body.orderId ? "Order not found." : "No previous orders found." },
      { status: 404 }
    );
  }

  if (sourceOrder.items.length === 0) {
    return NextResponse.json({ error: "This order has no items to reorder." }, { status: 400 });
  }

  const cart = await getOrCreateActiveCart(profile.customerId);

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  const cartItems = await Promise.all(
    sourceOrder.items.map((item) =>
      prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    message: `Added ${cartItems.length} item${cartItems.length === 1 ? "" : "s"} from order ${sourceOrder.orderNumber} to your cart.`,
    cartId: cart.id,
    itemsAdded: cartItems.length,
  });
}
