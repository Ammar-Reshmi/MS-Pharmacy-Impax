import Link from "next/link";

export function SiteFooter() {
  return <footer className="mt-20 bg-blue-950 text-slate-300">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
      <div><p className="font-serif text-2xl font-bold text-white">MS Pharma Impex</p><p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">A professional B2B catalogue and quotation workspace for pharmaceutical supply teams.</p><p className="mt-5 text-xs text-teal-300">Catalogue information supports commercial enquiries only. It is not medical advice.</p></div>
      <div><p className="text-sm font-bold text-white">Explore</p><div className="mt-4 grid gap-2 text-sm">{[["Catalogue", "/catalogue"], ["Request a quote", "/request-quote"], ["About", "/about"], ["Contact", "/contact"]].map(([label, href]) => <Link href={href} key={href} className="hover:text-white">{label}</Link>)}</div></div>
      <div><p className="text-sm font-bold text-white">Compliance</p><div className="mt-4 grid gap-2 text-sm"><Link href="/legal/privacy" className="hover:text-white">Privacy notice</Link><Link href="/legal/terms" className="hover:text-white">Quotation terms</Link><Link href="/admin/login" className="hover:text-white">Staff sign in</Link></div></div>
    </div>
    <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} MS Pharma Impex. All rights reserved.</div>
  </footer>;
}

