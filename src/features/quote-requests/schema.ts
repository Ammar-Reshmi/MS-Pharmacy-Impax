import { z } from "zod";

export const quoteRequestSchema = z.object({
  businessName: z.string().trim().min(2).max(220),
  contactName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().regex(/^[+0-9()\-\s]{7,30}$/, "Enter a valid phone number."),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9A-Z]{15}$/, "GSTIN must contain 15 letters or numbers.").optional().or(z.literal("")),
  address: z.string().trim().min(8).max(440),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(z.object({ medicineId: z.string().uuid(), quantity: z.coerce.number().int().min(1).max(10_000) })).min(1).max(50),
  consent: z.literal(true)
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

