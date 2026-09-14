import fs from "node:fs";
import path from "node:path";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Ensure environment variables from .env are available
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1];
        let val = match[2];
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/ms_pharma_impex";

async function seed() {
  console.log("Connecting to PostgreSQL...");
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log("Checking database connection and seeding core V1 data...");

    // 1. Seed Business Settings
    const existingSettings = await db.query.businessSettings.findFirst();
    if (!existingSettings) {
      console.log("Seeding business settings...");
      await db.insert(schema.businessSettings).values({
        legalName: "MS Pharma Impex Private Limited",
        displayName: "MS Pharma Impex",
        gstin: "27AABCM1234F1Z5",
        email: "contact@mspharmaimpex.com",
        phone: "+91 22 2345 6789",
        legalAddress: "Unit 402, Trade Link Hub, Andheri East, Mumbai, Maharashtra 400069, India",
        defaultGstRate: "12.00",
        quotationValidityDays: 30,
        defaultTerms: "1. Quotation prices are in INR and exclude applicable GST unless specified.\n2. Payment terms: 100% advance against Proforma Invoice or approved credit terms.\n3. Delivery timelines will be confirmed upon purchase order.\n4. Subject to standard supply terms and product availability.",
        authorizedSignatory: "Authorized Commercial Signatory"
      });
    }

    // 2. Seed Super Admin User
    const adminEmail = "admin@mspharmaimpex.com";
    let admin = await db.query.staffUsers.findFirst({
      where: eq(schema.staffUsers.email, adminEmail)
    });

    if (!admin) {
      console.log("Creating default super_admin account...");
      const passwordHash = await hash("Admin@123456");
      const [newAdmin] = await db.insert(schema.staffUsers).values({
        email: adminEmail,
        name: "MS Pharma Super Admin",
        passwordHash,
        role: "super_admin",
        active: true,
        emailVerifiedAt: new Date(),
        mfaEnabled: false
      }).returning();
      admin = newAdmin;
      console.log(`Created admin user: ${adminEmail} (password: Admin@123456)`);
    }

    // 3. Seed Sales Staff User
    const salesEmail = "sales@mspharmaimpex.com";
    const existingSales = await db.query.staffUsers.findFirst({
      where: eq(schema.staffUsers.email, salesEmail)
    });

    if (!existingSales) {
      console.log("Creating default sales account...");
      const passwordHash = await hash("Sales@123456");
      await db.insert(schema.staffUsers).values({
        email: salesEmail,
        name: "Commercial Sales Representative",
        passwordHash,
        role: "sales",
        active: true,
        emailVerifiedAt: new Date(),
        mfaEnabled: false
      });
      console.log(`Created sales user: ${salesEmail} (password: Sales@123456)`);
    }

    // 4. Seed Categories
    const categoryData = [
      { name: "Tablets", slug: "tablets", description: "Oral solid dosage tablets" },
      { name: "Capsules", slug: "capsules", description: "Hard and soft gelatin encapsulated formulations" },
      { name: "Injections", slug: "injections", description: "Sterile parenteral injectable preparations" },
      { name: "Oral Liquids", slug: "oral-liquids", description: "Syrups, suspensions, and oral solutions" }
    ];

    const categoryMap = new Map<string, string>();
    for (const cat of categoryData) {
      let existingCat = await db.query.categories.findFirst({
        where: eq(schema.categories.slug, cat.slug)
      });
      if (!existingCat) {
        const [newCat] = await db.insert(schema.categories).values(cat).returning();
        existingCat = newCat;
      }
      categoryMap.set(cat.slug, existingCat.id);
    }

    // 5. Seed Core Medicines and INR Prices
    const defaultCategoryId = categoryMap.get("tablets")!;
    const medicineRecords = [
      {
        sku: "MED-IVM-003",
        slug: "ivermectine-3-mg",
        productName: "Ivermectine 3 mg",
        genericName: "Ivermectin",
        strength: "3 mg",
        dosageForm: "Tablet",
        manufacturer: "Healing Pharma",
        composition: "Ivermectin IP 3 mg",
        description: "Anti-helminthic oral formulation used for the management and treatment of targeted parasitic infections.",
        packSize: "10 x 10 Tablets",
        prescriptionRequired: false,
        status: "published" as const,
        unitPrice: "150.00",
        gstRate: "12.00"
      },
      {
        sku: "MED-IVM-006",
        slug: "ivermectine-6-mg",
        productName: "Ivermectine 6 mg",
        genericName: "Ivermectin",
        strength: "6 mg",
        dosageForm: "Tablet",
        manufacturer: "Healing Pharma",
        composition: "Ivermectin IP 6 mg",
        description: "Anti-helminthic oral formulation used for the management and treatment of targeted parasitic infections.",
        packSize: "10 x 10 Tablets",
        prescriptionRequired: false,
        status: "published" as const,
        unitPrice: "220.00",
        gstRate: "12.00"
      },
      {
        sku: "MED-IVM-012",
        slug: "ivermectine-12-mg",
        productName: "Ivermectine 12 mg",
        genericName: "Ivermectin",
        strength: "12 mg",
        dosageForm: "Tablet",
        manufacturer: "Healing Pharma",
        composition: "Ivermectin IP 12 mg",
        description: "Anti-helminthic oral formulation used for the management and treatment of targeted parasitic infections.",
        packSize: "10 x 10 Tablets",
        prescriptionRequired: false,
        status: "published" as const,
        unitPrice: "350.00",
        gstRate: "12.00"
      },
      {
        sku: "MED-IVM-020",
        slug: "ivermectine-20-mg",
        productName: "Ivermectine 20 mg",
        genericName: "Ivermectin",
        strength: "20 mg",
        dosageForm: "Tablet",
        manufacturer: "Healing Pharma",
        composition: "Ivermectin IP 20 mg",
        description: "Anti-helminthic oral formulation used for the management and treatment of targeted parasitic infections.",
        packSize: "10 x 10 Tablets",
        prescriptionRequired: false,
        status: "published" as const,
        unitPrice: "520.00",
        gstRate: "12.00"
      },
      {
        sku: "MED-IVM-040",
        slug: "ivermectine-40-mg",
        productName: "Ivermectine 40 mg",
        genericName: "Ivermectin",
        strength: "40 mg",
        dosageForm: "Tablet",
        manufacturer: "Healing Pharma",
        composition: "Ivermectin IP 40 mg",
        description: "Anti-helminthic oral formulation used for the management and treatment of targeted parasitic infections.",
        packSize: "10 x 10 Tablets",
        prescriptionRequired: false,
        status: "published" as const,
        unitPrice: "850.00",
        gstRate: "12.00"
      },
      {
        sku: "MED-IVM-080",
        slug: "ivermectine-80-mg",
        productName: "Ivermectine 80 mg",
        genericName: "Ivermectin",
        strength: "80 mg",
        dosageForm: "Tablet",
        manufacturer: "Healing Pharma",
        composition: "Ivermectin IP 80 mg",
        description: "Anti-helminthic oral formulation used for the management and treatment of targeted parasitic infections.",
        packSize: "10 x 10 Tablets",
        prescriptionRequired: false,
        status: "published" as const,
        unitPrice: "1400.00",
        gstRate: "12.00"
      }
    ];

    for (const item of medicineRecords) {
      const existing = await db.query.medicines.findFirst({
        where: eq(schema.medicines.sku, item.sku)
      });

      if (!existing) {
        const [med] = await db.insert(schema.medicines).values({
          sku: item.sku,
          slug: item.slug,
          productName: item.productName,
          genericName: item.genericName,
          strength: item.strength,
          dosageForm: item.dosageForm,
          manufacturer: item.manufacturer,
          composition: item.composition,
          description: item.description,
          packSize: item.packSize,
          prescriptionRequired: item.prescriptionRequired,
          status: item.status,
          categoryId: defaultCategoryId,
          createdById: admin.id
        }).returning();

        await db.insert(schema.medicinePrices).values({
          medicineId: med.id,
          currency: "INR",
          unitPrice: item.unitPrice,
          gstRate: item.gstRate,
          isCurrent: true,
          createdById: admin.id
        });
        console.log(`Seeded medicine: ${item.productName} (INR ${item.unitPrice})`);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
