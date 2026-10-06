"use server";

import { revalidatePath } from "next/cache";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { generateSecret, generateURI, verify as verifyTotp } from "otplib";
import QRCode from "qrcode";
import { z } from "zod";
import { getDb } from "@/db";
import { auditLogs, staffUsers } from "@/db/schema";
import { requireStaff } from "@/lib/authorization";
import { decryptMfaSecret, encryptMfaSecret } from "@/lib/secrets";

const createStaffSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().max(320),
  password: z.string().min(6).max(256),
  role: z.enum(["super_admin", "sales", "catalogue_manager"])
});

export async function createStaffMember(formData: FormData) {
  const currentStaff = await requireStaff(["super_admin"]);
  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    return { ok: false, error: "Please enter valid staff details (minimum 6-character password)." };
  }

  const db = getDb();
  const existing = await db.query.staffUsers.findFirst({
    where: eq(staffUsers.email, parsed.data.email.toLowerCase().trim())
  });

  if (existing) {
    return { ok: false, error: "A staff account with this email already exists." };
  }

  const passwordHash = await hash(parsed.data.password);
  const [newStaff] = await db.insert(staffUsers).values({
    name: parsed.data.name.trim(),
    email: parsed.data.email.toLowerCase().trim(),
    passwordHash,
    role: parsed.data.role,
    active: true,
    emailVerifiedAt: new Date(),
    mfaEnabled: false
  }).returning();

  await db.insert(auditLogs).values({
    actorId: currentStaff.id,
    action: "create_staff",
    entityType: "staff_users",
    entityId: newStaff.id,
    metadata: { email: newStaff.email, role: newStaff.role }
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function resetStaffPassword(formData: FormData) {
  const currentStaff = await requireStaff(["super_admin"]);
  const staffId = formData.get("staffId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!staffId || !newPassword || newPassword.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters long." };
  }

  const db = getDb();
  const target = await db.query.staffUsers.findFirst({
    where: eq(staffUsers.id, staffId)
  });

  if (!target) {
    return { ok: false, error: "Staff user not found." };
  }

  const passwordHash = await hash(newPassword);
  await db.update(staffUsers).set({
    passwordHash,
    updatedAt: new Date()
  }).where(eq(staffUsers.id, staffId));

  await db.insert(auditLogs).values({
    actorId: currentStaff.id,
    action: "reset_staff_password",
    entityType: "staff_users",
    entityId: staffId,
    metadata: { email: target.email }
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function toggleStaffActive(formData: FormData) {
  const currentStaff = await requireStaff(["super_admin"]);
  const staffId = formData.get("staffId") as string;

  if (staffId === currentStaff.id) {
    return { ok: false, error: "You cannot deactivate your own account." };
  }

  const db = getDb();
  const target = await db.query.staffUsers.findFirst({
    where: eq(staffUsers.id, staffId)
  });

  if (!target) return { ok: false, error: "Staff member not found." };

  await db.update(staffUsers).set({
    active: !target.active,
    updatedAt: new Date()
  }).where(eq(staffUsers.id, staffId));

  await db.insert(auditLogs).values({
    actorId: currentStaff.id,
    action: target.active ? "deactivate_staff" : "activate_staff",
    entityType: "staff_users",
    entityId: staffId,
    metadata: { email: target.email, previousState: target.active }
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function startMfaSetup(): Promise<{ ok: boolean; secret?: string; qrCodeUrl?: string; uri?: string; error?: string }> {
  const currentStaff = await requireStaff();
  const secret = generateSecret();
  const uri = generateURI({
    secret,
    label: currentStaff.email ?? "staff@mspharmaimpex.com",
    issuer: "MS Pharma Impex"
  });

  try {
    const qrCodeUrl = await QRCode.toDataURL(uri);
    return { ok: true, secret, qrCodeUrl, uri };
  } catch (error) {
    return { ok: false, error: "Failed to generate QR code." };
  }
}

export async function verifyAndEnableMfa(secret: string, token: string): Promise<{ ok: boolean; error?: string }> {
  const currentStaff = await requireStaff();

  if (!token || token.length !== 6 || !/^\d{6}$/.test(token)) {
    return { ok: false, error: "Please enter a valid 6-digit code." };
  }

  const verification = await verifyTotp({ secret, token });
  if (!verification.valid) {
    return { ok: false, error: "Invalid authenticator code. Please ensure your clock is synchronized and try again." };
  }

  const encryptedSecret = encryptMfaSecret(secret);
  const db = getDb();
  await db.update(staffUsers).set({
    mfaEnabled: true,
    mfaSecretEncrypted: encryptedSecret,
    updatedAt: new Date()
  }).where(eq(staffUsers.id, currentStaff.id));

  await db.insert(auditLogs).values({
    actorId: currentStaff.id,
    action: "enable_mfa",
    entityType: "staff_users",
    entityId: currentStaff.id,
    metadata: { email: currentStaff.email }
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}

export async function disableMfa(staffId?: string): Promise<{ ok: boolean; error?: string }> {
  const currentStaff = await requireStaff();
  const targetId = staffId || currentStaff.id;

  if (targetId !== currentStaff.id && currentStaff.role !== "super_admin") {
    return { ok: false, error: "Only Super Admin can disable MFA for other accounts." };
  }

  const db = getDb();
  await db.update(staffUsers).set({
    mfaEnabled: false,
    mfaSecretEncrypted: null,
    updatedAt: new Date()
  }).where(eq(staffUsers.id, targetId));

  await db.insert(auditLogs).values({
    actorId: currentStaff.id,
    action: "disable_mfa",
    entityType: "staff_users",
    entityId: targetId,
    metadata: { targetId }
  });

  revalidatePath("/admin/staff");
  return { ok: true };
}
