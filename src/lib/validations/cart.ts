import { z } from "zod";

export const cartItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const checkoutInputSchema = z.object({
  notes: z.string().max(500).optional(),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
