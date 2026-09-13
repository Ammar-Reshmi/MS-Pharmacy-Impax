import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { auditLogs, businessSettings, categories, customers, medicinePrices, medicines, quoteRequestItems, quoteRequests, quotations, staffUsers } from "@/db/schema";

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

export type AdminCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  medicineCount: number;
};

export type AdminCustomerItem = {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  gstin: string | null;
  active: boolean;
  createdAt: Date;
};

export type AdminStaffItem = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "sales" | "catalogue_manager";
  active: boolean;
  mfaEnabled: boolean;
  lastSignedInAt: Date | null;
  createdAt: Date;
};

export type AdminAuditLogItem = {
  id: string;
  action: string;
  entityType: string;
  createdAt: Date;
  actorName: string | null;
};

export async function listAuditLogs(): Promise<AdminAuditLogItem[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({ id: auditLogs.id, action: auditLogs.action, entityType: auditLogs.entityType, createdAt: auditLogs.createdAt, actorName: staffUsers.name })
    .from(auditLogs).leftJoin(staffUsers, eq(auditLogs.actorId, staffUsers.id)).orderBy(desc(auditLogs.createdAt)).limit(100);
}

export async function listAdminCategories(): Promise<AdminCategoryItem[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({
    id: categories.id,
    name: categories.name,
    slug: categories.slug,
    description: categories.description,
    active: categories.active,
    createdAt: categories.createdAt,
    medicineCount: count(medicines.id)
  }).from(categories)
    .leftJoin(medicines, eq(medicines.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(categories.createdAt));
}

export async function listAdminCustomers(): Promise<AdminCustomerItem[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({
    id: customers.id,
    businessName: customers.businessName,
    contactName: customers.contactName,
    email: customers.email,
    phone: customers.phone,
    gstin: customers.gstin,
    active: customers.active,
    createdAt: customers.createdAt
  }).from(customers).orderBy(desc(customers.createdAt));
}

export async function listAdminStaff(): Promise<AdminStaffItem[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  return db.select({
    id: staffUsers.id,
    name: staffUsers.name,
    email: staffUsers.email,
    role: staffUsers.role,
    active: staffUsers.active,
    mfaEnabled: staffUsers.mfaEnabled,
    lastSignedInAt: staffUsers.lastSignedInAt,
    createdAt: staffUsers.createdAt
  }).from(staffUsers).orderBy(desc(staffUsers.createdAt));
}

export async function getAdminBusinessSettings() {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  return db.query.businessSettings.findFirst();
}


