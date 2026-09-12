import Link from "next/link";
import { Building2, FileText, Menu, Search } from "lucide-react";

const links = [
  ["Catalogue", "/catalogue"],
  ["Request quote", "/request-quote"],
  ["About", "/about"],
  ["Contact", "/contact"]
] as const;

export function SiteHeader() {
  return <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
    <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="group flex items-center gap-3" aria-label="MS Pharma Impex home">
        <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-teal-700 to-blue-950 text-white shadow-sm"><Building2 size={21} /></span>
        <span className="leading-none"><span className="block font-serif text-lg font-bold tracking-tight text-blue-950">MS Pharma Impex</span><span className="mt-1 block text-[9px] font-bold tracking-[0.18em] text-teal-700">PHARMACEUTICAL SUPPLY</span></span>
      </Link>
      <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
        {links.map(([label, href]) => <Link key={href} href={href} className="text-sm font-medium text-slate-600 transition hover:text-teal-700">{label}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/catalogue" className="grid size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100" aria-label="Search catalogue"><Search size={19} /></Link>
        <Link href="/request-quote" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"><FileText size={17} /> Request quote</Link>
      </div>
      <details className="relative lg:hidden"><summary className="grid size-10 cursor-pointer place-items-center rounded-xl text-slate-700 hover:bg-slate-100"><Menu size={20} /><span className="sr-only">Open menu</span></summary><div className="absolute right-0 top-12 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{links.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{label}</Link>)}</div></details>
    </div>
  </header>;
}

