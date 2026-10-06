import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Calendar, FileText, Mail, MapPin, Phone } from "lucide-react";
import { getAdminQuoteRequest } from "@/features/admin/queries";
import { requireStaff } from "@/lib/authorization";
import { formatInr } from "@/lib/money";
import { createDraftQuotationFromRequest } from "@/features/quotations/actions";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-800",
  converted: "bg-teal-50 text-teal-800",
  closed: "bg-slate-100 text-slate-600"
};

export default async function QuoteRequestDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [request, staff] = await Promise.all([getAdminQuoteRequest(id), requireStaff()]);

  if (!request) {
    notFound();
  }

  const canManage = staff.role === "super_admin" || staff.role === "sales";

  return (
    <div className="space-y-6">
      {/* Top navigation & action bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/quote-requests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
        >
          <ArrowLeft size={16} /> Back to quote requests
        </Link>
        {canManage && request.status === "submitted" && (
          <form action={createDraftQuotationFromRequest}>
            <input type="hidden" name="quoteRequestId" value={request.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-800 shadow-sm transition"
            >
              <FileText size={14} /> Create draft quotation
            </button>
          </form>
        )}
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-bold text-blue-950">{request.reference}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  statusStyle[request.status] ?? "bg-slate-100 text-slate-700"
                }`}
              >
                {request.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={13} />
              Received on{" "}
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "long",
                timeStyle: "short"
              }).format(new Date(request.createdAt))}
            </p>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Building2 size={14} className="text-teal-700" /> Customer Information
            </h3>
            <p className="mt-2 text-base font-bold text-slate-900">{request.businessName}</p>
            <p className="text-sm text-slate-600">{request.contactName}</p>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <Mail size={12} /> {request.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone size={12} /> {request.phone}
              </p>
              {request.gstin && <p className="font-medium text-slate-700">GSTIN: {request.gstin}</p>}
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MapPin size={14} className="text-teal-700" /> Delivery Location
            </h3>
            {request.address ? (
              <div className="mt-2 text-sm text-slate-600">
                <p>{request.address.line1}</p>
                {request.address.line2 && <p>{request.address.line2}</p>}
                <p>
                  {request.address.city}, {request.address.state} — {request.address.postalCode}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400 italic">No delivery address specified.</p>
            )}
          </div>
        </div>

        {/* Commercial notes from customer */}
        {request.notes && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Customer Notes / Requirements
            </h3>
            <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
              {request.notes}
            </p>
          </div>
        )}
      </div>

      {/* Requested Items Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-serif text-xl font-bold text-blue-950">
            Requested Medicines ({request.items.length})
          </h2>
          <p className="text-xs text-slate-500">
            Products and quantities requested by the client in this enquiry
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Medicine</th>
                <th className="px-6 py-3.5">Strength / Pack</th>
                <th className="px-6 py-3.5 text-right">Requested Qty</th>
                <th className="px-6 py-3.5 text-right">Catalogue Price</th>
                <th className="px-6 py-3.5 text-right">Est. Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {request.items.map((item: typeof request.items[number]) => {
                const estTotal = item.unitPrice
                  ? Number(item.unitPrice) * item.requestedQuantity
                  : null;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-950">{item.productName}</p>
                      {item.sku && <p className="text-xs text-slate-400">SKU: {item.sku}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {[item.strength, item.packSize, item.dosageForm].filter(Boolean).join(" · ") ||
                        "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {item.requestedQuantity}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {item.unitPrice ? formatInr(Number(item.unitPrice)) : "On request"}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-teal-800">
                      {estTotal !== null ? formatInr(estTotal) : "—"}
                    </td>
                  </tr>
                );
              })}
              {!request.items.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No items found in this request.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
