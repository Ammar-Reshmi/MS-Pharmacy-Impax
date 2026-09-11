import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { auditLogs, categories, customers, medicinePrices, medicines, quoteRequestItems, quoteRequests, quotations, staffUsers } from "@/db/schema";

export async function getDashboardMetrics() {
  if (!isDatabaseConfigured()) return { publishedMedicines: 0, openRequests: 0, draftQuotes: 0, activeStaff: 0 };
  const db = getDb();
  const [[publishedMedicines], [openRequests], [draftQuotes], [activeStaff]] = await Promise.all([
    db.select({ value: count() }).from(medicines).where(eq(medicines.status, "published")),
    db.select({ value: count() }).from(quoteRequests).where(and(eq(quoteRequests.status, "submitted"))),
    db.select({ value: count() }).from(quotations).where(eq(quotations.status, "draft")),
    db.select({ value: count() }).from(staffUsers).where(eq(staffUsers.active, true))
  ]);
  return { publishedMedicines: publishedMedicines.value, openRequests: openRequests.value, draftQuotes: draftQuotes.value, activeStaff: activeStaff.value };
}

export async function listStaffQuoteRequests() {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({
    id: quoteRequests.id,
    reference: quoteRequests.reference,
    status: quoteRequests.status,
    createdAt: quoteRequests.createdAt,
    businessName: customers.businessName,
    contactName: customers.contactName,
    email: customers.email,
    itemCount: count(quoteRequestItems.id)
  }).from(quoteRequests).innerJoin(customers, eq(quoteRequests.customerId, customers.id)).leftJoin(quoteRequestItems, eq(quoteRequestItems.quoteRequestId, quoteRequests.id)).groupBy(quoteRequests.id, customers.id).orderBy(desc(quoteRequests.createdAt));
}

export async function listStaffQuotations() {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({
    id: quotations.id,
    quoteNumber: quotations.quoteNumber,
    status: quotations.status,
    grandTotal: quotations.grandTotal,
    validUntil: quotations.validUntil,
    createdAt: quotations.createdAt,
    businessName: customers.businessName
  }).from(quotations).innerJoin(customers, eq(quotations.customerId, customers.id)).orderBy(desc(quotations.createdAt));
}

export async function listAdminMedicines() {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({ id: medicines.id, sku: medicines.sku, productName: medicines.productName, status: medicines.status, category: categories.name, price: medicinePrices.unitPrice, updatedAt: medicines.updatedAt })
    .from(medicines).leftJoin(categories, eq(medicines.categoryId, categories.id)).leftJoin(medicinePrices, and(eq(medicinePrices.medicineId, medicines.id), eq(medicinePrices.isCurrent, true))).orderBy(desc(medicines.updatedAt));
}

export async function listAuditLogs() {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({ id: auditLogs.id, action: auditLogs.action, entityType: auditLogs.entityType, createdAt: auditLogs.createdAt, actorName: staffUsers.name })
    .from(auditLogs).leftJoin(staffUsers, eq(auditLogs.actorId, staffUsers.id)).orderBy(desc(auditLogs.createdAt)).limit(100);
}

