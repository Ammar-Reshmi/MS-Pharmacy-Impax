import Link from "next/link";
import { LayoutGrid, Search } from "lucide-react";
import { MedicineCard } from "@/components/medicine-card";
import { listPublishedCategories, listPublishedMedicines } from "@/features/catalogue/queries";
import { CartBadge } from "@/components/quote-cart";

export const dynamic = "force-dynamic";

export default async function CataloguePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;

  const [medicines, catalogueCategories] = await Promise.all([
    listPublishedMedicines(q, category),
    listPublishedCategories()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.18em] text-teal-700">PRODUCT CATALOGUE</p>
        <h1 className="mt-3 font-serif text-5xl font-bold tracking-tight text-blue-950">
          Find the right medicine, clearly.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          Browse by category or search by name, generic name, manufacturer, or strength. Add products
          to your quote cart and submit a single request.
        </p>
      </div>

      {/* Search */}
      <form className="mt-10 flex max-w-3xl gap-2" action="/catalogue">
        {category && <input type="hidden" name="category" value={category} />}
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 shadow-sm focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
          <Search size={19} className="text-teal-700" />
          <input
            className="w-full bg-transparent text-sm outline-none"
            name="q"
            defaultValue={q}
            placeholder="Search product, generic, manufacturer, or strength"
          />
        </label>
        <button className="rounded-xl bg-blue-950 px-5 text-sm font-bold text-white hover:bg-blue-900">
          Search
        </button>
      </form>

      <div className="mt-10 flex gap-8 lg:gap-12">
        {/* ── Category sidebar ── */}
        {catalogueCategories.length > 0 && (
          <aside className="hidden w-52 shrink-0 lg:block">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Categories
            </p>
            <nav className="space-y-1">
              <Link
                href={q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue"}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  !category
                    ? "bg-teal-700 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <LayoutGrid size={15} />
                All products
              </Link>
              {catalogueCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue?category=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    category === cat.slug
                      ? "bg-teal-700 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      category === cat.slug
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat.medicineCount}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Mobile horizontal scroll for small screens */}
          </aside>
        )}

        {/* ── Product grid ── */}
        <div className="min-w-0 flex-1">
          {/* Mobile category scroll (visible only below lg) */}
          {catalogueCategories.length > 0 && (
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              <Link
                href={q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue"}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                  !category
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </Link>
              {catalogueCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/catalogue?category=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${
                    category === cat.slug
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {medicines.length ? (
            <>
              <p className="mb-5 text-sm text-slate-500">
                {medicines.length} approved {medicines.length === 1 ? "medicine" : "medicines"}
                {category
                  ? ` in "${catalogueCategories.find((c) => c.slug === category)?.name ?? category}"`
                  : ""}
                {q ? ` matching "${q}"` : ""}
              </p>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {medicines.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="font-serif text-2xl font-bold text-blue-950">
                No approved medicines to display
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
                Products are shown only after a staff member verifies product information and INR
                pricing. Contact the sales team for help with a requirement.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
              >
                Contact sales
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Floating cart badge — client-side */}
      <CartBadge />
    </div>
  );
}
