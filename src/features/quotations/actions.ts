"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, businessSettings, medicinePrices, medicines, quoteRequestItems, quoteRequests, quotationItems, quotations } from "@/db/schema";
import { requireStaff } from "@/lib/authorization";
import { publicReference } from "@/lib/ids";
import { calculateQuoteTotals, paiseToRupees, rupeesToPaise } from "@/lib/money";
import { assertQuotationTransition, type QuotationStatus } from "@/features/quotations/status";

const requestIdSchema = z.string().uuid();
const transitionSchema = z.object({ quotationId: z.string().uuid(), nextStatus: z.enum(["draft", "submitted", "under_review", "quoted", "sent", "accepted", "rejected", "expired"]) });

export async function createDraftQuotationFromRequest(formData: FormData) {
  const actor = await requireStaff(["super_admin", "sales"]);
  const parsed = requestIdSchema.safeParse(formData.get("quoteRequestId"));
  if (!parsed.success) throw new Error("Invalid quote request.");
  const db = getDb();
  const request = await db.query.quoteRequests.findFirst({ where: eq(quoteRequests.id, parsed.data) });
  if (!request) throw new Error("Quote request not found.");
  const sourceItems = await db.select({ medicineId: quoteRequestItems.medicineId, productName: quoteRequestItems.productName, quantity: quoteRequestItems.requestedQuantity })
    .from(quoteRequestItems).where(eq(quoteRequestItems.quoteRequestId, request.id));
  const medicineIds = sourceItems.flatMap((item) => item.medicineId ? [item.medicineId] : []);
  const sourceMedicines = medicineIds.length ? await db.select({ id: medicines.id, sku: medicines.sku, strength: medicines.strength, packSize: medicines.packSize, productName: medicines.productName, price: medicinePrices.unitPrice, gstRate: medicinePrices.gstRate })
    .from(medicines).innerJoin(medicinePrices, and(eq(medicinePrices.medicineId, medicines.id), eq(medicinePrices.isCurrent, true))).where(inArray(medicines.id, medicineIds)) : [];
  if (sourceMedicines.length !== sourceItems.length) throw new Error("Every requested medicine must have a current verified INR price before a quotation can be created.");
  const settings = await db.query.businessSettings.findFirst();
  if (!settings) throw new Error("Business settings must be completed before creating quotations.");
  const priceByMedicine = new Map(sourceMedicines.map((medicine) => [medicine.id, medicine]));
  const totals = calculateQuoteTotals(sourceItems.map((item) => {
    const medicine = priceByMedicine.get(item.medicineId!);
    return { quantity: item.quantity, unitPricePaise: rupeesToPaise(Number(medicine!.price)), gstRateBasisPoints: Math.round(Number(medicine!.gstRate) * 100) };
  }));
  await db.transaction(async (tx) => {
    const quotation = await tx.insert(quotations).values({
      quoteNumber: publicReference("Q"),
      quoteRequestId: request.id,
      customerId: request.customerId,
      status: "draft",
      subtotal: paiseToRupees(totals.subtotalPaise).toFixed(2),
      discount: "0.00",
      taxTotal: paiseToRupees(totals.taxPaise).toFixed(2),
      grandTotal: paiseToRupees(totals.grandTotalPaise).toFixed(2),
      termsSnapshot: settings.defaultTerms,
      validUntil: new Date(Date.now() + settings.quotationValidityDays * 86_400_000).toISOString().slice(0, 10),
      createdById: actor.id
    }).returning({ id: quotations.id, quoteNumber: quotations.quoteNumber });
    await tx.insert(quotationItems).values(sourceItems.map((item) => {
      const medicine = priceByMedicine.get(item.medicineId!)!;
      const unitPrice = Number(medicine.price);
      const lineTotal = unitPrice * item.quantity;
      return { quotationId: quotation[0].id, medicineId: medicine.id, skuSnapshot: medicine.sku, productNameSnapshot: medicine.productName, strengthSnapshot: medicine.strength, packSizeSnapshot: medicine.packSize, quantity: item.quantity, unitPrice: unitPrice.toFixed(2), gstRate: medicine.gstRate, lineTotal: lineTotal.toFixed(2) };
    }));
    await tx.update(quoteRequests).set({ status: "under_review", reviewedById: actor.id, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(quoteRequests.id, request.id));
    await tx.insert(auditLogs).values({ actorId: actor.id, action: "quotation.created", entityType: "quotation", entityId: quotation[0].id, metadata: { quoteNumber: quotation[0].quoteNumber, sourceRequest: request.reference } });
  });
  revalidatePath("/admin/quote-requests");
  revalidatePath("/admin/quotations");
}

export async function transitionQuotation(formData: FormData) {
  const actor = await requireStaff(["super_admin", "sales"]);
  const parsed = transitionSchema.safeParse({ quotationId: formData.get("quotationId"), nextStatus: formData.get("nextStatus") });
  if (!parsed.success) throw new Error("Invalid quotation status update.");
  const db = getDb();
  const quotation = await db.query.quotations.findFirst({ where: eq(quotations.id, parsed.data.quotationId) });
  if (!quotation) throw new Error("Quotation not found.");
  assertQuotationTransition(quotation.status as QuotationStatus, parsed.data.nextStatus);
  await db.transaction(async (tx) => {
    await tx.update(quotations).set({ status: parsed.data.nextStatus, issuedAt: parsed.data.nextStatus === "sent" ? new Date() : quotation.issuedAt, updatedAt: new Date() }).where(eq(quotations.id, quotation.id));
    await tx.insert(auditLogs).values({ actorId: actor.id, action: "quotation.status_changed", entityType: "quotation", entityId: quotation.id, metadata: { from: quotation.status, to: parsed.data.nextStatus } });
  });
  revalidatePath("/admin/quotations");
}

