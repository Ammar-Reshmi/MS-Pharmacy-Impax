import { QuoteRequestForm } from "@/components/quote-request-form";
import { listPublishedMedicines } from "@/features/catalogue/queries";

export const dynamic = "force-dynamic";

export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<{ medicine?: string }> }) {
  const [medicines, { medicine }] = await Promise.all([listPublishedMedicines(), searchParams]);
  const preselectedMedicineId = medicines.some((item) => item.id === medicine) ? medicine : undefined;
  return <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"><div className="max-w-2xl"><p className="text-xs font-bold tracking-[0.18em] text-teal-700">B2B QUOTATION REQUEST</p><h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-blue-950">Send your requirements with confidence.</h1><p className="mt-4 text-lg leading-8 text-slate-600">Select approved medicines, add your commercial details, and our staff will prepare a reviewed quotation. Submitting a request is not an order or a payment commitment.</p></div><div className="mt-10"><QuoteRequestForm medicines={medicines} preselectedMedicineId={preselectedMedicineId} /></div></div>;
}

