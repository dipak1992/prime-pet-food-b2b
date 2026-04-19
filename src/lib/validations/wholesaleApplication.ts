import { z } from "zod";

export const wholesaleApplicationSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  website: z.string().url().optional().or(z.literal("")),
  businessType: z.string().min(2),
  taxId: z.string().optional(),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(3),
  monthlyOrderEstimate: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export type WholesaleApplicationInput = z.infer<typeof wholesaleApplicationSchema>;
