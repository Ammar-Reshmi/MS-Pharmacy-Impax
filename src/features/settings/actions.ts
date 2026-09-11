"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, businessSettings } from "@/db/schema";
import { requireStaff } from "@/lib/authorization";

const businessSettingsSchema = z.object({
  legalName: z.string().trim().min(2).max(220),
  displayName: z.string().trim().min(2).max(120),
  gstin: z.string().trim().toUpperCase().regex(/^[0-9A-Z]{15}$/).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(30).optional().or(z.literal("")),
  legalAddress: z.string().trim().min(8).max(1000).optional().or(z.literal("")),
  defaultGstRate: z.coerce.number().min(0).max(100),
  quotationValidityDays: z.coerce.number().int().min(1).max(365),
  defaultTerms: z.string().trim().min(10).max(4000),
  authorizedSignatory: z.string().trim().min(2).max(160).optional().or(z.literal(""))
});

export async function saveBusinessSettings(formData: FormData) {
  const actor = await requireStaff(["super_admin"]);
  const parsed = businessSettingsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error("Review the business settings and correct the invalid fields.");
  const db = getDb();
  const settings = await db.query.businessSettings.findFirst();
  const values = { ...parsed.data, gstin: parsed.data.gstin || null, email: parsed.data.email || null, phone: parsed.data.phone || null, legalAddress: parsed.data.legalAddress || null, authorizedSignatory: parsed.data.authorizedSignatory || null, defaultGstRate: parsed.data.defaultGstRate.toFixed(2), updatedById: actor.id, updatedAt: new Date() };
  if (settings) await db.update(businessSettings).set(values).where(eq(businessSettings.id, settings.id));
  else await db.insert(businessSettings).values(values);
  await db.insert(auditLogs).values({ actorId: actor.id, action: "business_settings.updated", entityType: "business_settings", entityId: settings?.id, metadata: { legalName: parsed.data.legalName } });
  revalidatePath("/admin/settings");
}
