import Link from "next/link";
import { ArrowLeft, FileText, Pill, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublishedMedicine } from "@/features/catalogue/queries";
import { formatInr } from "@/lib/money";
import { AddToCartButton, CartBadge } from "@/components/quote-cart";

export const dynamic = "force-dynamic";

export default async function MedicineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const medicine = await getPublishedMedicine((await params).slug);
  if (!medicine) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
      >
        <ArrowLeft size={17} />
        Back to catalogue
      </Link>

      <div className="mt-7 grid gap-10 lg:grid-cols-[.85fr_1.15fr]">
        {/* Product image / icon */}
        <div className="grid min-h-96 place-items-center rounded-3xl bg-gradient-to-br from-teal-50 to-blue-50">
          <Pill size={100} strokeWidth={1} className="text-teal-700" />
        </div>

        {/* Product details */}
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-teal-700">
            {medicine.category ?? "PHARMACEUTICAL PRODUCT"}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-blue-950">
            {medicine.productName}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {medicine.genericName
              ? `Generic / salt: ${medicine.genericName}`
              : "Product information available from our sales team."}
          </p>

          <dl className="mt-8 grid grid-cols-2 border-t border-slate-200 text-sm">
            <div className="border-b border-r border-slate-200 py-4 pr-4">
              <dt className="text-slate-400">Strength</dt>
              <dd className="mt-1 font-semibold text-slate-800">{medicine.strength ?? "—"}</dd>
            </div>
            <div className="border-b border-slate-200 py-4 pl-4">
              <dt className="text-slate-400">Dosage form</dt>
              <dd className="mt-1 font-semibold text-slate-800">{medicine.dosageForm ?? "—"}</dd>
            </div>
            <div className="border-b border-r border-slate-200 py-4 pr-4">
              <dt className="text-slate-400">Manufacturer</dt>
              <dd className="mt-1 font-semibold text-slate-800">{medicine.manufacturer ?? "—"}</dd>
            </div>
            <div className="border-b border-slate-200 py-4 pl-4">
              <dt className="text-slate-400">Pack size</dt>
              <dd className="mt-1 font-semibold text-slate-800">{medicine.packSize ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-7">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Public catalogue price
            </p>
            <p className="mt-2 font-serif text-4xl font-bold text-teal-800">
              {medicine.unitPrice ? formatInr(Number(medicine.unitPrice)) : "On request"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              GST {medicine.gstRate ?? "0"}% where applicable
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {/* Add to cart (persists across pages) */}
            <AddToCartButton medicineId={medicine.id} />

            {/* Direct single-medicine quote link */}
            <Link
              href={`/request-quote?medicine=${medicine.id}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-blue-950 px-5 text-sm font-bold text-blue-950 hover:bg-blue-950 hover:text-white transition-colors"
            >
              <FileText size={18} />
              Request quote now
            </Link>
          </div>

          {medicine.prescriptionRequired && (
            <p className="mt-6 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800">
              <ShieldCheck className="shrink-0" size={19} />
              This catalogue indicator does not replace your responsibility to verify applicable
              prescription and supply requirements.
            </p>
          )}
        </div>
      </div>

      {/* Floating cart badge */}
      <CartBadge />
    </div>
  );
}
