"use client";

import { useState } from "react";
import { KeyRound, Shield, ShieldAlert, ShieldCheck, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createStaffMember, disableMfa, resetStaffPassword, startMfaSetup, toggleStaffActive, verifyAndEnableMfa } from "@/features/admin/staff-actions";

async function toggleStaffActiveVoid(formData: FormData): Promise<void> {
  await toggleStaffActive(formData);
}

type StaffItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  mfaEnabled: boolean;
  lastSignedInAt: Date | null;
  createdAt: Date;
};

export function StaffManager({
  staffList,
  currentStaffId,
  isSuperAdmin,
  currentStaffMfa
}: {
  staffList: StaffItem[];
  currentStaffId: string;
  isSuperAdmin: boolean;
  currentStaffMfa: boolean;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [resetPassUser, setResetPassUser] = useState<StaffItem | null>(null);

  // Add staff form state
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Reset pass state
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // MFA modal state
  const [mfaData, setMfaData] = useState<{ secret: string; qrCodeUrl: string; uri: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState(false);

  async function handleOpenMfa() {
    setMfaError(null);
    setMfaSuccess(false);
    setMfaLoading(true);
    setShowMfaModal(true);
    const res = await startMfaSetup();
    setMfaLoading(false);
    if (res.ok && res.secret && res.qrCodeUrl && res.uri) {
      setMfaData({ secret: res.secret, qrCodeUrl: res.qrCodeUrl, uri: res.uri });
    } else {
      setMfaError(res.error ?? "Failed to initialize MFA setup.");
    }
  }

  async function handleVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaData) return;
    setMfaLoading(true);
    setMfaError(null);
    const res = await verifyAndEnableMfa(mfaData.secret, mfaCode);
    setMfaLoading(false);
    if (res.ok) {
      setMfaSuccess(true);
      setTimeout(() => {
        setShowMfaModal(false);
        window.location.reload();
      }, 1500);
    } else {
      setMfaError(res.error ?? "Verification failed.");
    }
  }

  async function handleDisableMfa(staffId?: string) {
    if (!confirm("Are you sure you want to disable Multi-Factor Authentication?")) return;
    const res = await disableMfa(staffId);
    if (res.ok) {
      window.location.reload();
    } else {
      alert(res.error ?? "Failed to disable MFA.");
    }
  }

  async function handleAddStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createStaffMember(formData);
    setAddLoading(false);
    if (res.ok) {
      setShowAddModal(false);
      window.location.reload();
    } else {
      setAddError(res.error ?? "Failed to create staff account.");
    }
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resetPassUser) return;
    setPassLoading(true);
    setPassError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("staffId", resetPassUser.id);
    const res = await resetStaffPassword(formData);
    setPassLoading(false);
    if (res.ok) {
      setResetPassUser(null);
      alert(`Password updated successfully for ${resetPassUser.email}`);
    } else {
      setPassError(res.error ?? "Failed to reset password.");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {currentStaffMfa ? (
          <button
            onClick={() => handleDisableMfa()}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ShieldAlert size={15} className="text-amber-600" />
            Disable My MFA
          </button>
        ) : (
          <button
            onClick={handleOpenMfa}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-900"
          >
            <ShieldCheck size={15} className="text-teal-400" />
            Enable My MFA (Authenticator App)
          </button>
        )}

        {isSuperAdmin && (
          <Button onClick={() => setShowAddModal(true)} className="gap-2 text-xs min-h-9 px-3 py-2">
            <UserPlus size={15} />
            Add Staff Member
          </Button>
        )}
      </div>

      {/* Staff Table */}
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
                {isSuperAdmin && <th className="px-5 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-semibold text-blue-950">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">
                        {s.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span>
                        {s.name}
                        {s.id === currentStaffId && <span className="ml-1.5 text-xs text-teal-600 font-normal">(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{s.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 capitalize">
                      {s.role.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.mfaEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                      {s.mfaEnabled ? <ShieldCheck size={14} /> : <Shield size={14} />}
                      {s.mfaEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.active ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-800"}`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                    {s.lastSignedInAt
                      ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(s.lastSignedInAt))
                      : "Never"}
                  </td>
                  {isSuperAdmin && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setResetPassUser(s)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-teal-700 hover:text-teal-700"
                        >
                          Change password
                        </button>
                        {s.mfaEnabled && s.id !== currentStaffId && (
                          <button
                            type="button"
                            onClick={() => handleDisableMfa(s.id)}
                            className="rounded-lg border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                          >
                            Reset MFA
                          </button>
                        )}
                        {s.id !== currentStaffId && (
                          <form action={toggleStaffActiveVoid}>
                            <input type="hidden" name="staffId" value={s.id} />
                            <button
                              type="submit"
                              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${s.active ? "text-red-700 hover:bg-red-50" : "text-teal-700 hover:bg-teal-50"}`}
                            >
                              {s.active ? "Deactivate" : "Activate"}
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MFA Setup Modal */}
      {showMfaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-950 font-serif font-bold text-lg">
                <ShieldCheck className="text-teal-700" size={20} />
                Setup Two-Factor MFA
              </div>
              <button
                type="button"
                onClick={() => setShowMfaModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {mfaLoading && !mfaData && (
              <div className="py-10 text-center text-sm text-slate-500">
                Generating secure authenticator credentials...
              </div>
            )}

            {mfaSuccess ? (
              <div className="py-8 text-center">
                <ShieldCheck className="mx-auto text-emerald-600 mb-3" size={44} />
                <h3 className="font-serif text-xl font-bold text-blue-950">MFA Enabled!</h3>
                <p className="mt-2 text-xs text-slate-600">
                  Your account is now protected with 2-Factor Authentication. Use your authenticator app each time you sign in.
                </p>
              </div>
            ) : (
              mfaData && (
                <form onSubmit={handleVerifyMfa} className="mt-4 grid gap-4">
                  <p className="text-xs leading-5 text-slate-600">
                    Scan this QR code with <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>1Password</strong>:
                  </p>

                  <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-3">
                    <img
                      src={mfaData.qrCodeUrl}
                      alt="TOTP MFA QR Code"
                      width={180}
                      height={180}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                    <p className="text-[11px] font-medium text-slate-500">Or enter manual key:</p>
                    <p className="mt-0.5 font-mono text-xs font-bold text-slate-800 tracking-wider select-all">
                      {mfaData.secret.match(/.{1,4}/g)?.join(" ") ?? mfaData.secret}
                    </p>
                  </div>

                  <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                    Enter the 6-digit code shown in your app to confirm:
                    <div className="relative flex items-center">
                      <KeyRound className="absolute left-3 size-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.trim())}
                        className="w-full min-h-10 rounded-xl border border-slate-300 bg-white pl-9 pr-3 font-mono text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                  </label>

                  {mfaError && (
                    <div className="rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-800">
                      {mfaError}
                    </div>
                  )}

                  <div className="mt-2 flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setShowMfaModal(false)} className="w-1/2">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={mfaLoading || mfaCode.length !== 6} className="w-1/2">
                      {mfaLoading ? "Verifying..." : "Verify & Enable"}
                    </Button>
                  </div>
                </form>
              )
            )}
          </div>
        </div>
      )}

      {/* Add Staff Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-950 font-serif font-bold text-lg">
                <UserPlus className="text-teal-700" size={20} />
                Create New Staff Account
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-4 grid gap-4">
              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Full Name
                <input
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Work Email
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@mspharmaimpex.com"
                  className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Initial Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                Staff Role
                <select
                  name="role"
                  defaultValue="sales"
                  className="min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="sales">Sales Representative (Review & Quote)</option>
                  <option value="catalogue_manager">Catalogue Manager (Medicines & Import)</option>
                  <option value="super_admin">Super Admin (Full Access)</option>
                </select>
              </label>

              {addError && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-800">
                  {addError}
                </div>
              )}

              <div className="mt-2 flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="w-1/2">
                  Cancel
                </Button>
                <Button type="submit" disabled={addLoading} className="w-1/2">
                  {addLoading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {resetPassUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-blue-950 font-serif font-bold text-lg">
                Change Password: {resetPassUser.name}
              </div>
              <button
                type="button"
                onClick={() => setResetPassUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 grid gap-4">
              <p className="text-xs text-slate-600">
                Account: <strong>{resetPassUser.email}</strong>
              </p>

              <label className="grid gap-1.5 text-xs font-semibold text-slate-700">
                New Password
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password (min 6 characters)"
                  className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              {passError && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-800">
                  {passError}
                </div>
              )}

              <div className="mt-2 flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setResetPassUser(null)} className="w-1/2">
                  Cancel
                </Button>
                <Button type="submit" disabled={passLoading} className="w-1/2">
                  {passLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
