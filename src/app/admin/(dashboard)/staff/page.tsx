import { ShieldCheck } from "lucide-react";
import { StaffManager } from "@/components/staff-manager";
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
        <StaffManager
          staffList={staffList}
          currentStaffId={currentStaff.id}
          isSuperAdmin={isSuperAdmin}
          currentStaffMfa={currentStaff.mfaEnabled}
        />
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
