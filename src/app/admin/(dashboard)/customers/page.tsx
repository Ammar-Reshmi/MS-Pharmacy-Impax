import { listAdminCustomers } from "@/features/admin/queries";
import { requireStaff } from "@/lib/authorization";

export default async function AdminCustomersPage() {
  await requireStaff();
  const customers = await listAdminCustomers();

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">COMMERCIAL ACCOUNTS</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Customers</h1>
        <p className="mt-2 text-sm text-slate-600">Registered businesses and healthcare institutions that have requested quotations.</p>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Business</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">GSTIN</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-4 font-semibold text-blue-950">{c.businessName}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{c.contactName}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{c.phone}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{c.gstin ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${c.active ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(c.createdAt))}
                  </td>
                </tr>
              ))}
              {!customers.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No customer accounts recorded yet. Submitting a quotation request will automatically register the customer.
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
