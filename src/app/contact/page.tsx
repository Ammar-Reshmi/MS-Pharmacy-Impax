import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.8fr] lg:px-8"><div><p className="text-xs font-bold tracking-[0.18em] text-teal-700">CONTACT</p><h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-blue-950">Let’s discuss your business requirement.</h1><p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Use the structured quotation request so our sales team receives the product, quantity, and business information needed to respond accurately.</p><Link href="/request-quote" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800"><FileText size={18} /> Request a quotation</Link></div><aside className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><ShieldCheck className="text-teal-700" size={31} /><h2 className="mt-4 font-serif text-2xl font-bold text-blue-950">Business details are configured by staff</h2><p className="mt-3 text-sm leading-6 text-slate-600">Production contact details, legal address, GSTIN, banking information, and authorized signatory are managed in the secure staff settings area before the platform is published.</p></aside></div>;
}

