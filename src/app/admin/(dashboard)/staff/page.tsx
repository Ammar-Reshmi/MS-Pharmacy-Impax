import { ShieldCheck, UserCheck } from "lucide-react";
import { listAdminStaff } from "@/features/admin/queries";
import { requireStaff } from "@/lib/authorization";

export default async function AdminStaffPage() {
  const currentStaff = await requireStaff();
  const staffList = await listAdminStaff();
  const isSuperAdmin = currentStaff.role === "super_admin";

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-teal-700">USER ACCESS CONTROL</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Staff & Roles</h1>
          <p className="mt-2 text-sm text-slate-600">Authorized personnel who manage medicines, review quotation requests, and configure settings.</p>
        </div>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">MFA</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last Signed In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-4 font-semibold text-blue-950 flex items-center gap-2">
                    <UserCheck size={16} className="text-teal-700" />
                    {s.name}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{s.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 capitalize">
                      {s.role.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${s.mfaEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                      {s.mfaEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.active ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-800"}`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                    {s.lastSignedInAt
                      ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s.lastSignedInAt))
                      : "Never"}
                  </td>
                </tr>
              ))}
              {!staffList.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="mt-8 rounded-2xl bg-slate-50 border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <ShieldCheck className="text-teal-700 shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="font-serif text-lg font-bold text-blue-950">Role Permissions (V1)</h3>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3 text-slate-600">
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <strong className="block text-slate-900 mb-1">Super Admin</strong>
                Full access: staff management, business settings, quotations, catalogue governance, and audit trails.
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <strong className="block text-slate-900 mb-1">Sales</strong>
                Review quote requests, draft and issue quotations, manage customer records.
              </div>
              <div className="rounded-xl bg-white p-3 border border-slate-200">
                <strong className="block text-slate-900 mb-1">Catalogue Manager</strong>
                Import and edit medicine records, manage pricing, categories, and inventory definitions.
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
