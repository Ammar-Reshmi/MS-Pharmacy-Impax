import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 mb-4 ring-1 ring-teal-100">
            <ShieldCheck size={32} />
          </div>
          <p className="text-xs font-bold tracking-[0.18em] text-teal-700 uppercase">Authorized Access</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-blue-950">Staff Portal</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage quotations, catalogue, and commercial requests.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
