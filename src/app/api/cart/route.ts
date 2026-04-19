import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { getOrCreateActiveCart } from "@/lib/services/cart";

export async function GET() {
  const profile = await requireApprovedBuyer();

  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const cart = await getOrCreateActiveCart(profile.customerId);
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

  return NextResponse.json({
    cart: {
      id: cart.id,
      status: cart.status,
      notes: cart.notes,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productTitle: item.product.title,
        sku: item.product.sku,
        quantity: item.quantity,
        moq: item.product.moq,
        casePack: item.product.casePack,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.unitPrice) * item.quantity,
      })),
      subtotal,
    },
  });
}
