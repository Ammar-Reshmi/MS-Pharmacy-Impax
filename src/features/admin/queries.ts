import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { auditLogs, businessSettings, categories, customerAddresses, customers, medicinePrices, medicines, quotationItems, quoteRequestItems, quoteRequests, quotations, staffUsers } from "@/db/schema";

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

export type AdminQuoteRequestDetail = {
  id: string;
  reference: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  reviewedAt: Date | null;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  gstin: string | null;
  customerId: string;
  items: Array<{
    id: string;
    productName: string;
    requestedQuantity: number;
    medicineId: string | null;
    sku: string | null;
    strength: string | null;
    packSize: string | null;
    dosageForm: string | null;
    unitPrice: string | null;
  }>;
  address?: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
  } | null;
};

export type AdminQuotationDetail = {
  id: string;
  quoteNumber: string;
  status: string;
  currency: string;
  subtotal: string;
  discount: string;
  taxTotal: string;
  grandTotal: string;
  termsSnapshot: string;
  validUntil: string;
  issuedAt: Date | null;
  createdAt: Date;
  quoteRequestId: string | null;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  gstin: string | null;
  customerId: string;
  items: Array<{
    id: string;
    quotationId: string;
    medicineId: string | null;
    skuSnapshot: string | null;
    productNameSnapshot: string;
    strengthSnapshot: string | null;
    packSizeSnapshot: string | null;
    quantity: number;
    unitPrice: string;
    gstRate: string;
    lineTotal: string;
    createdAt: Date;
  }>;
  address?: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
};

export async function getAdminQuoteRequest(id: string): Promise<AdminQuoteRequestDetail | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const request = await db
    .select({
      id: quoteRequests.id,
      reference: quoteRequests.reference,
      status: quoteRequests.status,
      notes: quoteRequests.notes,
      createdAt: quoteRequests.createdAt,
      reviewedAt: quoteRequests.reviewedAt,
      businessName: customers.businessName,
      contactName: customers.contactName,
      email: customers.email,
      phone: customers.phone,
      gstin: customers.gstin,
      customerId: customers.id
    })
    .from(quoteRequests)
    .innerJoin(customers, eq(quoteRequests.customerId, customers.id))
    .where(eq(quoteRequests.id, id))
    .limit(1);

  if (!request[0]) return null;

  const [items, address] = await Promise.all([
    db
      .select({
        id: quoteRequestItems.id,
        productName: quoteRequestItems.productName,
        requestedQuantity: quoteRequestItems.requestedQuantity,
        medicineId: quoteRequestItems.medicineId,
        sku: medicines.sku,
        strength: medicines.strength,
        packSize: medicines.packSize,
        dosageForm: medicines.dosageForm,
        unitPrice: medicinePrices.unitPrice
      })
      .from(quoteRequestItems)
      .leftJoin(medicines, eq(quoteRequestItems.medicineId, medicines.id))
      .leftJoin(
        medicinePrices,
        and(eq(medicinePrices.medicineId, medicines.id), eq(medicinePrices.isCurrent, true))
      )
      .where(eq(quoteRequestItems.quoteRequestId, id)),
    db.query.customerAddresses.findFirst({
      where: eq(customerAddresses.customerId, request[0].customerId)
    })
  ]);

  return {
    ...request[0],
    items,
    address: address
      ? {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        }
      : null
  };
}

export async function getAdminQuotation(id: string): Promise<AdminQuotationDetail | null> {
  if (!isDatabaseConfigured()) return null;
  const db = getDb();
  const quotation = await db
    .select({
      id: quotations.id,
      quoteNumber: quotations.quoteNumber,
      status: quotations.status,
      currency: quotations.currency,
      subtotal: quotations.subtotal,
      discount: quotations.discount,
      taxTotal: quotations.taxTotal,
      grandTotal: quotations.grandTotal,
      termsSnapshot: quotations.termsSnapshot,
      validUntil: quotations.validUntil,
      issuedAt: quotations.issuedAt,
      createdAt: quotations.createdAt,
      quoteRequestId: quotations.quoteRequestId,
      businessName: customers.businessName,
      contactName: customers.contactName,
      email: customers.email,
      phone: customers.phone,
      gstin: customers.gstin,
      customerId: customers.id
    })
    .from(quotations)
    .innerJoin(customers, eq(quotations.customerId, customers.id))
    .where(eq(quotations.id, id))
    .limit(1);

  if (!quotation[0]) return null;

  const [items, address] = await Promise.all([
    db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, id)),
    db.query.customerAddresses.findFirst({
      where: eq(customerAddresses.customerId, quotation[0].customerId)
    })
  ]);

  return {
    ...quotation[0],
    items,
    address: address
      ? {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country
        }
      : null
  };
}



