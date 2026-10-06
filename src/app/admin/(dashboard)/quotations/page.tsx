import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { listStaffQuotations } from "@/features/admin/queries";
import { transitionQuotation } from "@/features/quotations/actions";
import type { QuotationStatus } from "@/features/quotations/status";
import { formatInr } from "@/lib/money";
import { requireStaff } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const nextStatus: Partial<Record<QuotationStatus, QuotationStatus>> = {
  draft: "submitted",
  submitted: "under_review",
  under_review: "quoted",
  quoted: "sent",
  sent: "accepted"
};

const statusStyle: Record<QuotationStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-800",
  quoted: "bg-purple-50 text-purple-700",
  sent: "bg-teal-50 text-teal-800",
  accepted: "bg-emerald-50 text-emerald-800",
  rejected: "bg-red-50 text-red-800",
  expired: "bg-slate-100 text-slate-500"
};

type StaffQuotation = Awaited<ReturnType<typeof listStaffQuotations>>[number];

export default async function QuotationsPage() {
  const [quotations, staff] = await Promise.all([listStaffQuotations(), requireStaff()]);
  const canManage = staff.role === "super_admin" || staff.role === "sales";

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">COMMERCIAL RECORDS</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Quotations</h1>
        <p className="mt-2 text-sm text-slate-600">
          Click any quotation to view its items, prices, and customer details, or download the official PDF.
        </p>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Quotation</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Valid until</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((quotation: StaffQuotation) => {
                const next = nextStatus[quotation.status];
                return (
                  <tr key={quotation.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/quotations/${quotation.id}`}
                        className="font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1.5"
                        title="Click to view quotation items and details"
                      >
                        {quotation.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {quotation.businessName}
                    </td>
                    <td className="px-5 py-4 font-bold text-teal-800">
                      {formatInr(Number(quotation.grandTotal))}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                        new Date(quotation.validUntil)
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[quotation.status]}`}
                      >
                        {quotation.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-700 transition"
                          href={`/admin/quotations/${quotation.id}`}
                          title="View items"
                        >
                          <Eye size={14} /> Items
                        </Link>
                        <a
                          className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-teal-700 hover:text-teal-700 transition"
                          href={`/api/documents/quotes/${quotation.id}`}
                          download
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </a>
                        {canManage && next && (
                          <form action={transitionQuotation}>
                            <input type="hidden" name="quotationId" value={quotation.id} />
                            <input type="hidden" name="nextStatus" value={next} />
                            <button className="rounded-lg bg-blue-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-900 transition">
                              Mark {next.replaceAll("_", " ")}
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!quotations.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No quotations have been created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
