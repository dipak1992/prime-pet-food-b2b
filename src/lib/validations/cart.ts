import { z } from "zod";

export const cartItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const addressSchema = z.object({
  line1: z.string().min(3, "Address line is required.").max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2, "City is required.").max(80),
  state: z.string().min(2, "State is required.").max(80),
  zip: z.string().min(3, "ZIP is required.").max(20),
  country: z.string().min(2).max(80).default("US"),
});

export const checkoutInputSchema = z
  .object({
    shippingAddress: addressSchema,
    billingSameAsShipping: z.boolean().default(true),
    billingAddress: addressSchema.optional(),
    poNumber: z.string().max(60).optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.billingSameAsShipping && !data.billingAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Billing address is required when billing differs from shipping.",
        path: ["billingAddress"],
      });
    }
  });

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
