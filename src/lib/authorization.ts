import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export type StaffRole = "super_admin" | "sales" | "catalogue_manager";

export async function requireStaff(roles?: StaffRole[]) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const user = session.user;
  if (roles && !roles.includes(user.role)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}

export function hasPermission(role: StaffRole, permission: "manage_staff" | "manage_catalogue" | "manage_quotes" | "view_audit" | "manage_settings") {
  const permissions: Record<StaffRole, readonly string[]> = {
    super_admin: ["manage_staff", "manage_catalogue", "manage_quotes", "view_audit", "manage_settings"],
    sales: ["manage_quotes"],
    catalogue_manager: ["manage_catalogue"]
  };
  return permissions[role].includes(permission);
}
