import { notFound } from "next/navigation";

const documents = {
  privacy: { title: "Privacy notice", intro: "MS Pharma Impex processes business contact information only to administer B2B quotation requests, staff access, and legitimate commercial records.", sections: [["Information we process", "Business name, professional contact information, addresses, GSTIN where provided, requested product quantities, and quotation activity."], ["How we use it", "To evaluate a request, prepare and administer quotations, meet applicable commercial and tax obligations, protect the platform, and maintain an audit trail."], ["Do not provide", "Do not include patient, prescription, diagnostic, or other sensitive health information in catalogue or quotation forms."]] },
  terms: { title: "Quotation terms", intro: "Catalogue prices and information are provided for commercial reference. A quotation becomes valid only when issued by an authorized MS Pharma Impex staff member.", sections: [["Validity", "Each issued quotation states its own validity period, commercial terms, tax treatment, availability, and delivery conditions."], ["No order or payment", "A request for quotation is not an order, acceptance, reservation of stock, or payment instruction."], ["Verification", "Buyers remain responsible for verifying product, licensing, prescription, supply, and regulatory requirements before purchase or distribution."]] }
} as const;

export default async function LegalPage({ params }: { params: Promise<{ document: string }> }) {
  const document = documents[(await params).document as keyof typeof documents];
  if (!document) notFound();
  return <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p className="text-xs font-bold tracking-[0.18em] text-teal-700">MS PHARMA IMPEX</p><h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-blue-950">{document.title}</h1><p className="mt-7 text-lg leading-8 text-slate-600">{document.intro}</p><div className="mt-10 grid gap-8">{document.sections.map(([title, text]) => <section key={title}><h2 className="font-serif text-2xl font-bold text-blue-950">{title}</h2><p className="mt-2 leading-7 text-slate-600">{text}</p></section>)}</div></article>;
}

