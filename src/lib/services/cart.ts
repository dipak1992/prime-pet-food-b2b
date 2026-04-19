import { prisma } from "@/lib/prisma";

type ValidationResult = { valid: true } | { valid: false; message: string };

export function validatePackConstraints(quantity: number, moq: number, casePack: number): ValidationResult {
  if (quantity < moq) {
    return { valid: false, message: `Minimum order quantity is ${moq}.` };
  }

  if (quantity % casePack !== 0) {
    return { valid: false, message: `Quantity must be in multiples of case pack (${casePack}).` };
  }

  return { valid: true };
}

export async function getOrCreateActiveCart(customerId: string) {
  const existing = await prisma.cart.findFirst({
    where: { customerId, status: "ACTIVE" },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: {
      customerId,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function computeCartSubtotal(cartId: string): Promise<number> {
  const items = await prisma.cartItem.findMany({
    where: { cartId },
  });

  return items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
}

export function deriveShippingTotal(subtotal: number, threshold: number): number {
  if (subtotal >= threshold) {
    return 0;
  }
  return 24;
}
