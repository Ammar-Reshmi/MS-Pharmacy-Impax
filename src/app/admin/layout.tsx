import { AdminShell } from "@/components/admin-shell";
import { requireStaff } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const staff = await requireStaff();
  return <AdminShell staff={staff}>{children}</AdminShell>;
}

