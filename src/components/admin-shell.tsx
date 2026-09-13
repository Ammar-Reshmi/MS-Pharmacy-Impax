import Link from "next/link";
import { Archive, Bell, BookOpen, ClipboardList, FileText, LayoutDashboard, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import type { StaffRole } from "@/lib/authorization";
import { signOutStaff } from "@/features/admin/auth-actions";

const navigation = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Quote requests", "/admin/quote-requests", ClipboardList],
  ["Quotations", "/admin/quotations", FileText],
  ["Catalogue", "/admin/catalogue", BookOpen],
  ["Categories", "/admin/categories", Archive],
  ["Customers", "/admin/customers", Users],
  ["Staff", "/admin/staff", Users],
  ["Settings", "/admin/settings", Settings],
  ["Audit log", "/admin/audit-log", ShieldCheck]
] as const;

export function AdminShell({ children, staff }: { children: React.ReactNode; staff: { name?: string | null; email?: string | null; role: StaffRole } }) {
  return <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[224px_1fr] lg:px-8"><aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"><div className="border-b border-slate-100 p-3"><p className="text-xs font-bold tracking-[0.16em] text-teal-700">STAFF WORKSPACE</p><p className="mt-1 truncate text-sm font-bold text-blue-950">{staff.name ?? staff.email}</p><p className="mt-0.5 text-xs capitalize text-slate-500">{staff.role.replaceAll("_", " ")}</p></div><nav className="mt-3 grid gap-1" aria-label="Staff navigation">{navigation.map(([label, href, Icon]) => <Link href={href} key={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800"><Icon size={17} />{label}</Link>)}</nav><form action={signOutStaff} className="mt-4 border-t border-slate-100 pt-3"><button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700"><LogOut size={17} />Sign out</button></form><div className="mt-4 rounded-xl bg-slate-50 p-3"><p className="flex items-center gap-2 text-xs font-bold text-slate-700"><Bell size={15} className="text-teal-700" /> V2 automation</p><p className="mt-1 text-xs leading-5 text-slate-500">Email, documents, and real-time alerts are deliberately queued for the next release.</p></div></aside><section className="min-w-0">{children}</section></div>;
}

