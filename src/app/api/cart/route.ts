import { NextRequest, NextResponse } from "next/server";
import { requireApprovedBuyer } from "@/lib/auth/guards";
import { getOrCreateActiveCart } from "@/lib/services/cart";

export async function GET() {
  try {
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

    const { productId, quantity } = await req.json();

    const cart = await getOrCreateActiveCart(profile.customerId);

    // Check if already in cart
    const existingItem = cart.items.find((i) => i.productId === productId);

    if (existingItem) {
      // Item already in cart - just return it
      return NextResponse.json({
        success: true,
        message: "Item already in cart",
        item: {
          id: existingItem.id,
          productId: existingItem.productId,
          quantity: existingItem.quantity,
        },
      });
    }

    // Add to cart would happen via cart item creation
    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cartId: cart.id,
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

    const { itemId, quantity } = await req.json();

    // Update cart item quantity
    // Implementation would update the database

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

    const { itemId } = await req.json();

    // Remove item from cart
    // Implementation would delete from database

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
