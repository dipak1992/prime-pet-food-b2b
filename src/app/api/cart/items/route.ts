import { NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { getOrCreateActiveCart, validatePackConstraints } from "@/lib/services/cart";
import { cartItemInputSchema } from "@/lib/validations/cart";

export async function POST(request: Request) {
  const profile = await requireApprovedBuyer();
  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const body = await request.json();
  const parsed = cartItemInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, isActive: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const validation = validatePackConstraints(parsed.data.quantity, product.moq, product.casePack);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const cart = await getOrCreateActiveCart(profile.customerId);

  const item = await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: product.id,
      },
    },
    create: {
      cartId: cart.id,
      productId: product.id,
      quantity: parsed.data.quantity,
      unitPrice: product.wholesalePrice,
    },
    update: {
      quantity: parsed.data.quantity,
      unitPrice: product.wholesalePrice,
    },
  });

  return NextResponse.json({
    item: {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
    },
  });
}

export async function DELETE(request: Request) {
  const profile = await requireApprovedBuyer();
  if (!profile.customerId) {
    return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
  }

  const payload = (await request.json().catch(() => ({}))) as { productId?: string };
  if (!payload.productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }

  const cart = await getOrCreateActiveCart(profile.customerId);

  await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
      productId: payload.productId,
    },
  });

  return NextResponse.json({ success: true });
}
