import { z } from "zod";

const legacyMoney = z.string().regex(/^₹\s?\d+(?:\.\d{1,2})?$/, "Use a verified INR amount such as ₹125.00.");

export const importMedicineRowSchema = z.object({
  sku: z.string().trim().min(2).max(80),
  productName: z.string().trim().min(2).max(220),
  genericName: z.string().trim().max(220).optional(),
  strength: z.string().trim().max(80).optional(),
  dosageForm: z.string().trim().max(80).optional(),
  manufacturer: z.string().trim().max(160).optional(),
  packSize: z.string().trim().max(80).optional(),
  category: z.string().trim().min(2).max(120),
  unitPriceInr: legacyMoney.optional(),
  gstRate: z.coerce.number().min(0).max(100).optional(),
  publish: z.enum(["yes", "no"]).default("no")
}).superRefine((row, ctx) => {
  if (row.publish === "yes" && !row.unitPriceInr) {
    ctx.addIssue({ code: "custom", path: ["unitPriceInr"], message: "A verified INR price is required before publishing." });
  }
});

export function validateImportRows(rows: unknown[]) {
  return rows.map((row, index) => ({ rowNumber: index + 2, result: importMedicineRowSchema.safeParse(row) }));
}

