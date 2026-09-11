import "server-only";

import { and, asc, eq, ilike, or } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/db";
import { categories, medicinePrices, medicines } from "@/db/schema";

export type CatalogueMedicine = {
  id: string;
  slug: string;
  sku: string;
  productName: string;
  genericName: string | null;
  strength: string | null;
  dosageForm: string | null;
  manufacturer: string | null;
  packSize: string | null;
  prescriptionRequired: boolean;
  category: string | null;
  unitPrice: string | null;
  gstRate: string | null;
};

export async function listPublishedMedicines(search?: string): Promise<CatalogueMedicine[]> {
  if (!isDatabaseConfigured()) return [];
  const db = getDb();
  const searchTerm = search?.trim();
  const filters = [eq(medicines.status, "published")];
  if (searchTerm) {
    const pattern = `%${searchTerm.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
    filters.push(or(
      ilike(medicines.productName, pattern),
      ilike(medicines.genericName, pattern),
      ilike(medicines.manufacturer, pattern),
      ilike(medicines.strength, pattern)
    )!);
  }
  return db.select({
    id: medicines.id,
    slug: medicines.slug,
    sku: medicines.sku,
    productName: medicines.productName,
    genericName: medicines.genericName,
    strength: medicines.strength,
    dosageForm: medicines.dosageForm,
    manufacturer: medicines.manufacturer,
    packSize: medicines.packSize,
    prescriptionRequired: medicines.prescriptionRequired,
    category: categories.name,
    unitPrice: medicinePrices.unitPrice,
    gstRate: medicinePrices.gstRate
  }).from(medicines)
    .leftJoin(categories, eq(medicines.categoryId, categories.id))
    .leftJoin(medicinePrices, and(eq(medicinePrices.medicineId, medicines.id), eq(medicinePrices.isCurrent, true)))
    .where(and(...filters))
    .orderBy(asc(medicines.productName));
}

export async function getPublishedMedicine(slug: string) {
  const results = await listPublishedMedicines();
  return results.find((medicine) => medicine.slug === slug) ?? null;
}

