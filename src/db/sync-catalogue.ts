import { and, eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { catalogueMaster, imagePathForForm } from "./catalogue-master";
import * as schema from "./schema";
import { categories, medicineImages, medicinePrices, medicines } from "./schema";
import { slugify } from "../lib/slug";

type CatalogueDb = PostgresJsDatabase<typeof schema>;

export async function syncCatalogueMaster(db: CatalogueDb, createdById: string) {
  const categoryIds = new Map<string, string>();
  const uniqueCategories = [...new Map(catalogueMaster.map((item) => [item.categorySlug, { name: item.categoryName, slug: item.categorySlug }])).values()];

  for (const category of uniqueCategories) {
    let existing = await db.query.categories.findFirst({ where: eq(categories.slug, category.slug) });
    if (!existing) {
      const [created] = await db.insert(categories).values({ name: category.name, slug: category.slug, description: category.name }).returning();
      existing = created;
    }
    categoryIds.set(category.slug, existing.id);
  }

  for (const item of catalogueMaster) {
    const slug = slugify(item.productName);
    const existing = await db.query.medicines.findFirst({ where: eq(medicines.sku, item.sku) });
    const payload = {
      sku: item.sku,
      slug,
      productName: item.productName,
      genericName: item.genericName,
      strength: item.strength,
      dosageForm: item.dosageForm,
      manufacturer: item.manufacturer,
      composition: item.composition,
      description: item.description,
      packSize: item.packSize,
      prescriptionRequired: item.categorySlug === "erectile-dysfunction",
      status: "published" as const,
      categoryId: categoryIds.get(item.categorySlug)!,
      createdById,
      updatedAt: new Date()
    };

    const medicineId = existing
      ? (await db.update(medicines).set(payload).where(eq(medicines.id, existing.id)).returning({ id: medicines.id }))[0].id
      : (await db.insert(medicines).values(payload).returning({ id: medicines.id }))[0].id;

    const storageKey = imagePathForForm(item.imageKey);
    const image = await db.query.medicineImages.findFirst({ where: eq(medicineImages.medicineId, medicineId) });
    if (!image) {
      await db.insert(medicineImages).values({
        medicineId,
        storageKey,
        altText: `${item.productName} ${item.dosageForm.toLowerCase()} pack shot`,
        sortOrder: 0,
        approvedAt: new Date(),
        approvedById: createdById
      });
    } else if (image.storageKey !== storageKey) {
      await db.update(medicineImages).set({ storageKey, altText: `${item.productName} ${item.dosageForm.toLowerCase()} pack shot` }).where(eq(medicineImages.id, image.id));
    }

    const currentPrice = await db.query.medicinePrices.findFirst({
      where: and(eq(medicinePrices.medicineId, medicineId), eq(medicinePrices.isCurrent, true))
    });
    if (item.preserveSeedPrice && currentPrice) continue;
    if (currentPrice && Number(currentPrice.unitPrice) === Number(item.unitPrice) && Number(currentPrice.gstRate) === Number(item.gstRate)) continue;
    if (currentPrice) {
      await db.update(medicinePrices).set({ isCurrent: false }).where(eq(medicinePrices.id, currentPrice.id));
    }
    await db.insert(medicinePrices).values({
      medicineId,
      currency: "INR",
      unitPrice: item.unitPrice ?? "0.00",
      gstRate: item.gstRate,
      isCurrent: true,
      createdById
    });
  }
}
