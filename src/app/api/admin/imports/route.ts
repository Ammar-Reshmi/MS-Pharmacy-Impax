import { auth } from "@/auth";
import { getDb } from "@/db";
import { auditLogs, importBatches, importRows } from "@/db/schema";
import { validateImportRows } from "@/features/imports/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

const allowedMimeTypes = new Set(["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !["super_admin", "catalogue_manager"].includes(session.user.role)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "staff";
  try { await enforceRateLimit("upload", `${session.user.id}:${ip}`); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Rate limit exceeded" }, { status: 429 }); }
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) return Response.json({ error: "Attach a CSV or XLSX file." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024 || !allowedMimeTypes.has(file.type) || !/\.(csv|xlsx)$/i.test(file.name)) return Response.json({ error: "Only CSV or XLSX files under 5 MB are accepted." }, { status: 400 });
  try {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellFormula: false, cellHTML: false, cellText: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) return Response.json({ error: "The file does not contain a worksheet." }, { status: 400 });
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" }).slice(0, 5000);
    if (!rawRows.length) return Response.json({ error: "The worksheet does not contain catalogue rows." }, { status: 400 });
    const normalized = rawRows.map((row) => ({ sku: row.SKU ?? row.sku ?? "", productName: row["Product Name"] ?? row.productName ?? "", genericName: row["Generic Name"] ?? row.genericName ?? "", strength: row.Strength ?? row.strength ?? "", dosageForm: row["Dosage Form"] ?? row.dosageForm ?? "", manufacturer: row.Manufacturer ?? row.manufacturer ?? "", packSize: row["Pack Size"] ?? row.packSize ?? "", category: row.Category ?? row.category ?? "", unitPriceInr: row["Unit Price INR"] ?? row.unitPriceInr ?? "", gstRate: row["GST Rate"] ?? row.gstRate ?? "", publish: String(row.Publish ?? row.publish ?? "no").toLowerCase() }));
    const validations = validateImportRows(normalized);
    const invalid = validations.filter((item) => !item.result.success).length;
    const db = getDb();
    const batch = await db.insert(importBatches).values({ sourceFileName: file.name, status: invalid ? "uploaded" : "validated", summary: { total: normalized.length, valid: normalized.length - invalid, invalid }, createdById: session.user.id }).returning({ id: importBatches.id });
    await db.insert(importRows).values(validations.map((entry, index) => ({ batchId: batch[0].id, rowNumber: entry.rowNumber, rawData: normalized[index], validationErrors: entry.result.success ? [] : entry.result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) })));
    await db.insert(auditLogs).values({ actorId: session.user.id, action: "catalogue_import.staged", entityType: "import_batch", entityId: batch[0].id, metadata: { fileName: file.name, total: normalized.length, invalid } });
    return Response.json({ batchId: batch[0].id, status: invalid ? "uploaded" : "validated", total: normalized.length, valid: normalized.length - invalid, invalid });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? "Unable to validate that file." : "Unable to validate that file." }, { status: 400 });
  }
}

