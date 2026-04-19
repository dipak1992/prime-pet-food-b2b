import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveCart } from "@/lib/services/cart";

/**
 * Reorder Last Order
 * Clones items from the customer's most recent order into the active cart
 */
export async function POST() {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  // Get the most recent order
  const lastOrder = await prisma.order.findFirst({
    where: { customerId: profile.customerId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (!lastOrder) {
    return NextResponse.json({ error: "No previous orders found." }, { status: 404 });
  }

  if (lastOrder.items.length === 0) {
    return NextResponse.json({ error: "Last order has no items." }, { status: 400 });
  }

  // Get active cart
  const cart = await getOrCreateActiveCart(profile.customerId);

  // Clear existing cart items
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  // Add items from last order to cart
  const cartItems = await Promise.all(
    lastOrder.items.map((item) =>
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
    message: `Reordered ${cartItems.length} items from order ${lastOrder.orderNumber}`,
    cartId: cart.id,
    itemsAdded: cartItems.length,
  });
}
