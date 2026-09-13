import { ShieldCheck } from "lucide-react";
import { listAuditLogs } from "@/features/admin/queries";
import { requireStaff } from "@/lib/authorization";

export default async function AdminAuditLogPage() {
  await requireStaff();
  const logs = await listAuditLogs();

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">COMPLIANCE & TRACEABILITY</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Audit Trail</h1>
        <p className="mt-2 text-sm text-slate-600">
          Immutable log of administrative and commercial actions across the platform.
        </p>
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Entity</th>
                <th className="px-5 py-4">Actor</th>
                <th className="px-5 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-blue-950">{log.action}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700">{log.actorName ?? "System / Anonymous"}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "medium"
                    }).format(new Date(log.createdAt))}
                  </td>
                </tr>
              ))}
              {!logs.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    No audit records logged yet.
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
