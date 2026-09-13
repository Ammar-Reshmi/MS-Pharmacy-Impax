"use client";

import { useActionState } from "react";
import { Lock, Mail, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authenticateStaff } from "@/features/admin/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(authenticateStaff, undefined);

  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5">
        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Work Email
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 size-4 text-slate-400" />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@mspharmaimpex.com"
              className="w-full min-h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-normal outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          Password
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 size-4 text-slate-400" />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full min-h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm font-normal outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </label>

        <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
          <span className="flex items-center justify-between">
            <span>Authenticator Code</span>
            <span className="text-xs font-normal text-slate-400">If MFA enabled</span>
          </span>
          <div className="relative flex items-center">
            <KeyRound className="absolute left-3.5 size-4 text-slate-400" />
            <input
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit code"
              className="w-full min-h-11 rounded-xl border border-slate-300 bg-white pl-10 pr-3 font-mono text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </label>

        {state?.error && (
          <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
            {state.error}
          </div>
        )}

        <Button type="submit" disabled={pending} className="w-full mt-2">
          {pending ? "Signing in..." : "Sign in to portal"}
        </Button>
      </div>
    </form>
  );
}
