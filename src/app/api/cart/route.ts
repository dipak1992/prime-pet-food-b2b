import { NextRequest, NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma";
import { deriveShippingTotal, getOrCreateActiveCart, validatePackConstraints } from "@/lib/services/cart";

export async function GET() {
  try {
    const profile = await requireApprovedBuyer();

    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const cart = await getOrCreateActiveCart(profile.customerId);
    const customer = await prisma.customer.findUnique({ where: { id: profile.customerId } });
    const threshold = Number(customer?.freeShippingThreshold ?? 150);
    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const shippingTotal = deriveShippingTotal(subtotal, threshold);
    const taxTotal = Number((subtotal * 0.08).toFixed(2));
    const grandTotal = Number((subtotal + shippingTotal + taxTotal).toFixed(2));

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
        shippingTotal,
        taxTotal,
        grandTotal,
        freeShippingThreshold: threshold,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();

    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const payload = (await req.json().catch(() => ({}))) as { productId?: string; quantity?: number };
    if (!payload.productId || !payload.quantity) {
      return NextResponse.json({ error: "productId and quantity are required." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: payload.productId, isActive: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const validation = validatePackConstraints(payload.quantity, product.moq, product.casePack);
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
        quantity: payload.quantity,
        unitPrice: product.wholesalePrice,
      },
      update: {
        quantity: payload.quantity,
        unitPrice: product.wholesalePrice,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      item: {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
      },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();

    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const payload = (await req.json().catch(() => ({}))) as { itemId?: string; quantity?: number };
    if (!payload.itemId || !payload.quantity) {
      return NextResponse.json({ error: "itemId and quantity are required." }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: payload.itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.customerId !== profile.customerId) {
      return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
    }

    const validation = validatePackConstraints(payload.quantity, item.product.moq, item.product.casePack);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: payload.quantity },
    });

    return NextResponse.json({
      success: true,
      message: "Quantity updated",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const profile = await requireApprovedBuyer();

    if (!profile.customerId) {
      return NextResponse.json({ error: "Customer profile not found." }, { status: 400 });
    }

    const payload = (await req.json().catch(() => ({}))) as { itemId?: string };
    if (!payload.itemId) {
      return NextResponse.json({ error: "itemId is required." }, { status: 400 });
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: payload.itemId },
      include: { cart: true },
    });

    if (!item || item.cart.customerId !== profile.customerId) {
      return NextResponse.json({ error: "Cart item not found." }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: payload.itemId } });

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
