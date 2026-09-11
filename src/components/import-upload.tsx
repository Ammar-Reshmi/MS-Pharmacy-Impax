"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

type ImportResponse = { batchId?: string; status?: string; total?: number; valid?: number; invalid?: number; error?: string };

export function ImportUpload() {
  const [result, setResult] = useState<ImportResponse>();
  const [busy, setBusy] = useState(false);
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setResult(undefined);
    const response = await fetch("/api/admin/imports", { method: "POST", body: new FormData(event.currentTarget) });
    setResult(await response.json() as ImportResponse); setBusy(false);
  }
  return <form onSubmit={upload} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700"><Upload size={18} className="text-teal-700" /><span>Stage a CSV or XLSX catalogue import</span><input type="file" name="file" accept=".csv,.xlsx" required className="sr-only" /></label><button disabled={busy} className="mt-3 rounded-lg bg-blue-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? "Validating…" : "Upload and validate"}</button>{result && <p className={`mt-3 text-xs font-medium ${result.error ? "text-red-700" : "text-slate-600"}`}>{result.error ?? `Batch ${result.batchId}: ${result.valid} valid, ${result.invalid} invalid of ${result.total} rows. Review the staged batch before approval.`}</p>}</form>;
}

