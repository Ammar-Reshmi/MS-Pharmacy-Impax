import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Printer, Building2, MapPin, Mail, Phone } from "lucide-react";
import { getAdminQuotation } from "@/features/admin/queries";
import { requireStaff } from "@/lib/authorization";
import { formatInr } from "@/lib/money";
import { transitionQuotation } from "@/features/quotations/actions";
import type { QuotationStatus } from "@/features/quotations/status";

export const dynamic = "force-dynamic";

const nextStatus: Partial<Record<QuotationStatus, QuotationStatus>> = {
  draft: "submitted",
  submitted: "under_review",
  under_review: "quoted",
  quoted: "sent",
  sent: "accepted"
};

const statusStyle: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-800",
  quoted: "bg-purple-50 text-purple-700",
  sent: "bg-teal-50 text-teal-800",
  accepted: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-800",
  expired: "bg-slate-100 text-slate-500"
};

export default async function QuotationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quotation, staff] = await Promise.all([getAdminQuotation(id), requireStaff()]);

  if (!quotation) {
    notFound();
  }

  const canManage = staff.role === "super_admin" || staff.role === "sales";
  const next = nextStatus[quotation.status as QuotationStatus];

  return (
    <div className="space-y-6">
      {/* Top navigation & action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft size={16} /> Back to quotations
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/documents/quotes/${quotation.id}`}
            download
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 shadow-sm transition"
          >
            <Download size={14} /> Download PDF
          </a>
          {canManage && next && (
            <form action={transitionQuotation}>
              <input type="hidden" name="quotationId" value={quotation.id} />
              <input type="hidden" name="nextStatus" value={next} />
              <button
                type="submit"
                className="rounded-xl bg-blue-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-900 transition"
              >
                Mark as {next.replaceAll("_", " ")}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Quotation Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-blue-950">
                {quotation.quoteNumber}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  statusStyle[quotation.status] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {quotation.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Created on{" "}
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "long",
                timeStyle: "short"
              }).format(new Date(quotation.createdAt))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">Grand total</p>
            <p className="font-serif text-3xl font-bold text-teal-800">
              {formatInr(Number(quotation.grandTotal))}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Valid until:{" "}
              <strong>
                {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                  new Date(quotation.validUntil)
                )}
              </strong>
            </p>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Building2 size={14} className="text-teal-700" /> Customer Information
            </h3>
            <p className="mt-2 text-base font-bold text-slate-900">{quotation.businessName}</p>
            <p className="text-sm text-slate-600">{quotation.contactName}</p>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <Mail size={12} /> {quotation.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={12} /> {quotation.phone}
              </p>
              {quotation.gstin && <p className="font-medium text-slate-700">GSTIN: {quotation.gstin}</p>}
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MapPin size={14} className="text-teal-700" /> Delivery Address
            </h3>
            {quotation.address ? (
              <div className="mt-2 text-sm text-slate-600">
                <p>{quotation.address.line1}</p>
                {quotation.address.line2 && <p>{quotation.address.line2}</p>}
                <p>
                  {quotation.address.city}, {quotation.address.state} — {quotation.address.postalCode}
                </p>
                <p>{quotation.address.country === "IN" ? "India" : quotation.address.country}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400 italic">No separate address registered.</p>
            )}
          </div>
        </div>
      </div>

      {/* Items in Quotation Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-serif text-xl font-bold text-blue-950">
            Quotation Items ({quotation.items.length})
          </h2>
          <p className="text-xs text-slate-500">
            Medicines, strengths, unit prices, GST rates, and totals included in this quotation
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Medicine / Item</th>
                <th className="px-6 py-3.5">Pack Size</th>
                <th className="px-6 py-3.5 text-right">Quantity</th>
                <th className="px-6 py-3.5 text-right">Unit Price</th>
                <th className="px-6 py-3.5 text-right">GST Rate</th>
                <th className="px-6 py-3.5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.items.map((item: typeof quotation.items[number]) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-blue-950">{item.productNameSnapshot}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {[
                        item.strengthSnapshot ? `Strength: ${item.strengthSnapshot}` : null,
                        item.skuSnapshot ? `SKU: ${item.skuSnapshot}` : null
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.packSizeSnapshot ?? "—"}</td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700">
                    {formatInr(Number(item.unitPrice))}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">{item.gstRate}%</td>
                  <td className="px-6 py-4 text-right font-bold text-teal-800">
                    {formatInr(Number(item.lineTotal))}
                  </td>
                </tr>
              ))}
              {!quotation.items.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No items in this quotation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quotation Financials Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 p-6">
          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="flex w-64 justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                {formatInr(Number(quotation.subtotal))}
              </span>
            </div>
            {Number(quotation.discount) > 0 && (
              <div className="flex w-64 justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-semibold">-{formatInr(Number(quotation.discount))}</span>
              </div>
            )}
            <div className="flex w-64 justify-between text-slate-600">
              <span>GST Total:</span>
              <span className="font-semibold text-slate-800">
                {formatInr(Number(quotation.taxTotal))}
              </span>
            </div>
            <div className="flex w-64 justify-between border-t border-slate-200 pt-2 font-serif text-lg font-bold text-blue-950">
              <span>Grand Total:</span>
              <span className="text-teal-800">{formatInr(Number(quotation.grandTotal))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      {quotation.termsSnapshot && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Terms & Conditions
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
            {quotation.termsSnapshot}
          </p>
        </div>
      )}
    </div>
  );
}
