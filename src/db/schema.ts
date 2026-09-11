import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const staffRole = pgEnum("staff_role", ["super_admin", "sales", "catalogue_manager"]);
export const medicineStatus = pgEnum("medicine_status", ["draft", "published", "archived"]);
export const quoteRequestStatus = pgEnum("quote_request_status", ["submitted", "under_review", "converted", "closed"]);
export const quotationStatus = pgEnum("quotation_status", ["draft", "submitted", "under_review", "quoted", "sent", "accepted", "rejected", "expired"]);
export const importStatus = pgEnum("import_status", ["uploaded", "validated", "approved", "committed", "rejected"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const staffUsers = pgTable("staff_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: staffRole("role").notNull().default("sales"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  mfaSecretEncrypted: text("mfa_secret_encrypted"),
  active: boolean("active").notNull().default(true),
  lastSignedInAt: timestamp("last_signed_in_at", { withTimezone: true }),
  ...timestamps
}, (table) => [uniqueIndex("staff_users_email_unique").on(table.email)]);

export const staffInvitations = pgTable("staff_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  role: staffRole("role").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  invitedById: uuid("invited_by_id").references(() => staffUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("staff_invitations_email_token_unique").on(table.email, table.tokenHash)]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  ...timestamps
}, (table) => [uniqueIndex("categories_slug_unique").on(table.slug)]);

export const medicines = pgTable("medicines", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: varchar("sku", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 180 }).notNull(),
  productName: varchar("product_name", { length: 220 }).notNull(),
  genericName: varchar("generic_name", { length: 220 }),
  strength: varchar("strength", { length: 80 }),
  dosageForm: varchar("dosage_form", { length: 80 }),
  manufacturer: varchar("manufacturer", { length: 160 }),
  composition: text("composition"),
  description: text("description"),
  packSize: varchar("pack_size", { length: 80 }),
  prescriptionRequired: boolean("prescription_required").notNull().default(false),
  status: medicineStatus("status").notNull().default("draft"),
  categoryId: uuid("category_id").references(() => categories.id),
  createdById: uuid("created_by_id").references(() => staffUsers.id),
  ...timestamps
}, (table) => [
  uniqueIndex("medicines_sku_unique").on(table.sku),
  uniqueIndex("medicines_slug_unique").on(table.slug),
  index("medicines_status_category_index").on(table.status, table.categoryId),
  index("medicines_name_index").on(table.productName)
]);

export const medicineImages = pgTable("medicine_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  medicineId: uuid("medicine_id").notNull().references(() => medicines.id, { onDelete: "cascade" }),
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  altText: varchar("alt_text", { length: 250 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  approvedById: uuid("approved_by_id").references(() => staffUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("medicine_images_medicine_index").on(table.medicineId)]);

export const medicinePrices = pgTable("medicine_prices", {
  id: uuid("id").defaultRandom().primaryKey(),
  medicineId: uuid("medicine_id").notNull().references(() => medicines.id, { onDelete: "cascade" }),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  validFrom: timestamp("valid_from", { withTimezone: true }).defaultNow().notNull(),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  isCurrent: boolean("is_current").notNull().default(true),
  createdById: uuid("created_by_id").references(() => staffUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("medicine_prices_current_index").on(table.medicineId, table.isCurrent),
  check("medicine_prices_currency_check", sql`currency = 'INR'`),
  check("medicine_prices_amount_check", sql`unit_price >= 0 AND gst_rate >= 0`)
]);

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: varchar("business_name", { length: 220 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  gstin: varchar("gstin", { length: 15 }),
  active: boolean("active").notNull().default(true),
  ...timestamps
}, (table) => [index("customers_email_index").on(table.email), index("customers_business_name_index").on(table.businessName)]);

export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  line1: varchar("line_1", { length: 220 }).notNull(),
  line2: varchar("line_2", { length: 220 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  country: varchar("country", { length: 2 }).notNull().default("IN"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("customer_addresses_customer_index").on(table.customerId)]);

export const quoteRequests = pgTable("quote_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  reference: varchar("reference", { length: 32 }).notNull(),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  status: quoteRequestStatus("status").notNull().default("submitted"),
  notes: text("notes"),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  reviewedById: uuid("reviewed_by_id").references(() => staffUsers.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("quote_requests_reference_unique").on(table.reference), index("quote_requests_status_created_index").on(table.status, table.createdAt)]);

export const quoteRequestItems = pgTable("quote_request_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteRequestId: uuid("quote_request_id").notNull().references(() => quoteRequests.id, { onDelete: "cascade" }),
  medicineId: uuid("medicine_id").references(() => medicines.id),
  productName: varchar("product_name", { length: 220 }).notNull(),
  requestedQuantity: integer("requested_quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("quote_request_items_request_index").on(table.quoteRequestId), check("quote_request_items_quantity_check", sql`requested_quantity > 0`)]);

export const quotations = pgTable("quotations", {
  id: uuid("id").defaultRandom().primaryKey(),
  quoteNumber: varchar("quote_number", { length: 40 }).notNull(),
  quoteRequestId: uuid("quote_request_id").references(() => quoteRequests.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  status: quotationStatus("status").notNull().default("draft"),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 14, scale: 2 }).notNull().default("0"),
  taxTotal: numeric("tax_total", { precision: 14, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).notNull().default("0"),
  termsSnapshot: text("terms_snapshot").notNull(),
  validUntil: date("valid_until").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  createdById: uuid("created_by_id").notNull().references(() => staffUsers.id),
  ...timestamps
}, (table) => [
  uniqueIndex("quotations_quote_number_unique").on(table.quoteNumber),
  index("quotations_customer_status_index").on(table.customerId, table.status),
  check("quotations_currency_check", sql`currency = 'INR'`),
  check("quotations_totals_check", sql`subtotal >= 0 AND discount >= 0 AND tax_total >= 0 AND grand_total >= 0`)
]);

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").notNull().references(() => quotations.id, { onDelete: "cascade" }),
  medicineId: uuid("medicine_id").references(() => medicines.id),
  skuSnapshot: varchar("sku_snapshot", { length: 80 }),
  productNameSnapshot: varchar("product_name_snapshot", { length: 220 }).notNull(),
  strengthSnapshot: varchar("strength_snapshot", { length: 80 }),
  packSizeSnapshot: varchar("pack_size_snapshot", { length: 80 }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 14, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("quotation_items_quotation_index").on(table.quotationId), check("quotation_items_quantity_check", sql`quantity > 0`)]);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  quotationId: uuid("quotation_id").references(() => quotations.id, { onDelete: "cascade" }),
  storageKey: varchar("storage_key", { length: 500 }).notNull(),
  contentType: varchar("content_type", { length: 100 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  createdById: uuid("created_by_id").references(() => staffUsers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("documents_quotation_index").on(table.quotationId)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipientId: uuid("recipient_id").notNull().references(() => staffUsers.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  href: varchar("href", { length: 500 }),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("notifications_recipient_read_index").on(table.recipientId, table.readAt)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => staffUsers.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  ipHash: varchar("ip_hash", { length: 128 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [index("audit_logs_entity_index").on(table.entityType, table.entityId), index("audit_logs_actor_created_index").on(table.actorId, table.createdAt)]);

export const importBatches = pgTable("import_batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceFileName: varchar("source_file_name", { length: 255 }).notNull(),
  storageKey: varchar("storage_key", { length: 500 }),
  status: importStatus("status").notNull().default("uploaded"),
  summary: jsonb("summary").notNull().default({}),
  createdById: uuid("created_by_id").notNull().references(() => staffUsers.id),
  approvedById: uuid("approved_by_id").references(() => staffUsers.id),
  committedAt: timestamp("committed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});

export const importRows = pgTable("import_rows", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").notNull().references(() => importBatches.id, { onDelete: "cascade" }),
  rowNumber: integer("row_number").notNull(),
  rawData: jsonb("raw_data").notNull(),
  validationErrors: jsonb("validation_errors").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [uniqueIndex("import_rows_batch_row_unique").on(table.batchId, table.rowNumber)]);

export const businessSettings = pgTable("business_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  legalName: varchar("legal_name", { length: 220 }).notNull(),
  displayName: varchar("display_name", { length: 120 }).notNull().default("MS Pharma Impax"),
  gstin: varchar("gstin", { length: 15 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  legalAddress: text("legal_address"),
  bankDetailsEncrypted: text("bank_details_encrypted"),
  defaultGstRate: numeric("default_gst_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  quotationValidityDays: integer("quotation_validity_days").notNull().default(30),
  defaultTerms: text("default_terms").notNull().default("Prices and availability are subject to confirmation."),
  authorizedSignatory: varchar("authorized_signatory", { length: 160 }),
  updatedById: uuid("updated_by_id").references(() => staffUsers.id),
  ...timestamps
}, (table) => [check("business_settings_validity_check", sql`quotation_validity_days BETWEEN 1 AND 365`)]);
