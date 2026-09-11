import Link from "next/link";
import { Search } from "lucide-react";
import { MedicineCard } from "@/components/medicine-card";
import { listPublishedMedicines } from "@/features/catalogue/queries";

export const dynamic = "force-dynamic";

export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const medicines = await listPublishedMedicines(q);
  return <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-bold tracking-[0.18em] text-teal-700">PRODUCT CATALOGUE</p><h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-blue-950">Find the right medicine, clearly.</h1><p className="mt-4 text-lg leading-8 text-slate-600">Search approved products by name, generic name, manufacturer, or strength. Public prices are listed in INR.</p></div><form className="mt-10 flex max-w-3xl gap-2" action="/catalogue"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 shadow-sm focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100"><Search size={19} className="text-teal-700" /><input className="w-full bg-transparent text-sm outline-none" name="q" defaultValue={q} placeholder="Search product, generic, manufacturer, or strength" /></label><button className="rounded-xl bg-blue-950 px-5 text-sm font-bold text-white hover:bg-blue-900">Search</button></form>{medicines.length ? <><p className="mt-7 text-sm text-slate-500">{medicines.length} approved {medicines.length === 1 ? "medicine" : "medicines"}{q ? ` matching “${q}”` : ""}</p><div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{medicines.map((medicine) => <MedicineCard key={medicine.id} medicine={medicine} />)}</div></> : <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="font-serif text-2xl font-bold text-blue-950">No approved medicines to display</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Products are shown only after a staff member verifies product information and INR pricing. Contact the sales team for help with a requirement.</p><Link href="/contact" className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800">Contact sales</Link></div>}</div>;
}

