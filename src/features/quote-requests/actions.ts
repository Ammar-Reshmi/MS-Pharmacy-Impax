"use server";

import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db";
import { auditLogs, customerAddresses, customers, medicines, quoteRequestItems, quoteRequests } from "@/db/schema";
import { publicReference } from "@/lib/ids";
import { enforceRateLimit } from "@/lib/rate-limit";
import { quoteRequestSchema, type QuoteRequestInput } from "@/features/quote-requests/schema";

export type QuoteRequestActionState = { ok: boolean; reference?: string; error?: string; fieldErrors?: Record<string, string[]> };

export async function createQuoteRequest(_: QuoteRequestActionState, formData: FormData): Promise<QuoteRequestActionState> {
  const rawItems = formData.get("items");
  let items: unknown;
  try {
    items = typeof rawItems === "string" ? JSON.parse(rawItems) : [];
  } catch {
    return { ok: false, error: "Your selected products could not be read. Please try again." };
  }
  const input = Object.fromEntries(formData.entries());
  const parsed = quoteRequestSchema.safeParse({ ...input, items, consent: formData.get("consent") === "on" });
  if (!parsed.success) return { ok: false, error: "Please correct the highlighted information.", fieldErrors: parsed.error.flatten().fieldErrors };

  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const requester = forwardedFor ?? requestHeaders.get("x-real-ip") ?? "anonymous";
  try {
    await enforceRateLimit("quote-request", requester);
    return await persistQuoteRequest(parsed.data);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "We could not submit your request." };
  }
}

async function persistQuoteRequest(input: QuoteRequestInput): Promise<QuoteRequestActionState> {
  const db = getDb();
  const medicineIds = input.items.map((item) => item.medicineId);
  const selectedMedicines = await db.select({ id: medicines.id, productName: medicines.productName })
    .from(medicines)
    .where(and(inArray(medicines.id, medicineIds), eq(medicines.status, "published")));
  if (selectedMedicines.length !== medicineIds.length) {
    return { ok: false, error: "One or more selected medicines are no longer available. Refresh the catalogue and try again." };
  }
  const reference = publicReference("QR");
  await db.transaction(async (tx) => {
    const existing = await tx.query.customers.findFirst({ where: eq(customers.email, input.email.toLowerCase()) });
    const customerId = existing?.id ?? (await tx.insert(customers).values({
      businessName: input.businessName,
      contactName: input.contactName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      gstin: input.gstin || null
    }).returning({ id: customers.id }))[0].id;

    if (!existing) {
      await tx.insert(customerAddresses).values({
        customerId,
        line1: input.address,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode
      });
    }
    const request = await tx.insert(quoteRequests).values({
      reference,
      customerId,
      notes: input.notes || null,
      consentAt: new Date()
    }).returning({ id: quoteRequests.id });
    const namesById = new Map(selectedMedicines.map((medicine) => [medicine.id, medicine.productName]));
    await tx.insert(quoteRequestItems).values(input.items.map((item) => ({
      quoteRequestId: request[0].id,
      medicineId: item.medicineId,
      productName: namesById.get(item.medicineId)!,
      requestedQuantity: item.quantity
    })));
    await tx.insert(auditLogs).values({
      action: "quote_request.submitted",
      entityType: "quote_request",
      entityId: request[0].id,
      metadata: { reference, itemCount: input.items.length }
    });
  });
  return { ok: true, reference };
}

