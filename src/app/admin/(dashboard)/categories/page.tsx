import { Plus } from "lucide-react";
import { listAdminCategories } from "@/features/admin/queries";
import { createCategory } from "@/features/catalogue/actions";
import { requireStaff } from "@/lib/authorization";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const staff = await requireStaff();
  const categories = await listAdminCategories();
  const canManage = staff.role === "super_admin" || staff.role === "catalogue_manager";

  return (
    <>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-teal-700">CATALOGUE STRUCTURE</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Categories</h1>
          <p className="mt-2 text-sm text-slate-600">Organize pharmaceutical products by therapeutic or dosage classification.</p>
        </div>
      </div>

      {canManage && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-blue-950">Add new category</h2>
          <form action={createCategory} className="mt-3 flex flex-wrap gap-3">
            <input
              name="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Category name (e.g. Antibiotics, Ointments)"
              className="min-h-11 min-w-[280px] flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
            <Button type="submit">
              <Plus size={16} /> Create category
            </Button>
          </form>
        </section>
      )}

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Medicines</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-5 py-4 font-semibold text-blue-950">{cat.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-5 py-4 text-slate-600 font-medium">{cat.medicineCount}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cat.active ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-600"}`}>
                      {cat.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500">
                    {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(cat.createdAt))}
                  </td>
                </tr>
              ))}
              {!categories.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No categories found. Create a category to organize medicines.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
