import Link from "next/link";
import { Eye } from "lucide-react";
import { createDraftQuotationFromRequest } from "@/features/quotations/actions";
import { listStaffQuoteRequests } from "@/features/admin/queries";
import { requireStaff } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-800",
  converted: "bg-teal-50 text-teal-800",
  closed: "bg-slate-100 text-slate-600"
};

export default async function QuoteRequestsPage() {
  const [requests, staff] = await Promise.all([listStaffQuoteRequests(), requireStaff()]);
  const canManage = staff.role === "super_admin" || staff.role === "sales";

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">COMMERCIAL INTAKE</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Quote requests</h1>
        <p className="mt-2 text-sm text-slate-600">
          Click any request reference or &ldquo;Items&rdquo; to view the customer&rsquo;s requested medicines, quantities, and notes.
        </p>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Reference</th>
                <th className="px-5 py-4">Business</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Received</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request: (typeof requests)[number]) => (
                <tr key={request.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/quote-requests/${request.id}`}
                      className="font-bold text-teal-700 hover:text-teal-900 hover:underline"
                      title="Click to view requested medicines and customer details"
                    >
                      {request.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{request.businessName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {request.contactName} · {request.email}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/quote-requests/${request.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-teal-700 hover:underline"
                    >
                      {request.itemCount} {request.itemCount === 1 ? "medicine" : "medicines"}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle[request.status]}`}
                    >
                      {request.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                      new Date(request.createdAt)
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-teal-700 hover:text-teal-700 transition"
                        href={`/admin/quote-requests/${request.id}`}
                        title="View requested items"
                      >
                        <Eye size={14} /> Items
                      </Link>
                      {canManage && request.status === "submitted" && (
                        <form action={createDraftQuotationFromRequest}>
                          <input type="hidden" name="quoteRequestId" value={request.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800 transition"
                          >
                            Create draft
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No quote requests have been received yet.
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
