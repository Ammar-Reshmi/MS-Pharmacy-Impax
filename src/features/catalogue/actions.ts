"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, categories } from "@/db/schema";
import { requireStaff } from "@/lib/authorization";

const categorySchema = z.object({ name: z.string().trim().min(2).max(120) });

function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const actor = await requireStaff(["super_admin", "catalogue_manager"]);
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) throw new Error("Enter a category name between 2 and 120 characters.");
  const db = getDb();
  const slug = slugify(parsed.data.name);
  const existing = await db.query.categories.findFirst({ where: eq(categories.slug, slug) });
  if (existing) throw new Error("A category with this name already exists.");
  const created = await db.insert(categories).values({ name: parsed.data.name, slug }).returning({ id: categories.id });
  await db.insert(auditLogs).values({ actorId: actor.id, action: "category.created", entityType: "category", entityId: created[0].id, metadata: { name: parsed.data.name } });
  revalidatePath("/admin/categories");
}

