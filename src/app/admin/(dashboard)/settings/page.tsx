import { getAdminBusinessSettings } from "@/features/admin/queries";
import { saveBusinessSettings } from "@/features/settings/actions";
import { requireStaff } from "@/lib/authorization";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsPage() {
  const [settings, staff] = await Promise.all([getAdminBusinessSettings(), requireStaff()]);
  const canEdit = staff.role === "super_admin";

  return (
    <>
      <div>
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">ORGANIZATION SETTINGS</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-blue-950">Business Profile & Terms</h1>
        <p className="mt-2 text-sm text-slate-600">
          These details are stamped on quotations, proforma invoices, and official communications.
        </p>
      </div>

      <form action={saveBusinessSettings} className="mt-7 grid gap-6 max-w-4xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-blue-950">Company Identity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Legal Business Name
              <input
                name="legalName"
                required
                defaultValue={settings?.legalName ?? "MS Pharma Impax Private Limited"}
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Display Brand Name
              <input
                name="displayName"
                required
                defaultValue={settings?.displayName ?? "MS Pharma Impax"}
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Company GSTIN
              <input
                name="gstin"
                maxLength={15}
                defaultValue={settings?.gstin ?? ""}
                placeholder="27AABCM1234F1Z5"
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 font-mono text-sm font-normal uppercase outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Authorized Signatory
              <input
                name="authorizedSignatory"
                defaultValue={settings?.authorizedSignatory ?? ""}
                placeholder="Commercial Director / Signatory"
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-blue-950">Contact & Address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Official Email
              <input
                name="email"
                type="email"
                defaultValue={settings?.email ?? ""}
                placeholder="sales@mspharmaimpex.com"
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Contact Phone
              <input
                name="phone"
                type="tel"
                defaultValue={settings?.phone ?? ""}
                placeholder="+91 22 2345 6789"
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-slate-700">
            Registered Legal Address
            <textarea
              name="legalAddress"
              rows={3}
              defaultValue={settings?.legalAddress ?? ""}
              placeholder="Full registered address..."
              disabled={!canEdit}
              className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-blue-950">Quotation Defaults</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Default GST Rate (%)
              <input
                name="defaultGstRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                defaultValue={settings?.defaultGstRate ?? "12.00"}
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-slate-700">
              Quotation Validity (Days)
              <input
                name="quotationValidityDays"
                type="number"
                min="1"
                max="365"
                required
                defaultValue={settings?.quotationValidityDays ?? 30}
                disabled={!canEdit}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-slate-700">
            Default Terms & Conditions
            <textarea
              name="defaultTerms"
              rows={4}
              required
              defaultValue={settings?.defaultTerms ?? "1. Quotation prices are in INR.\n2. Taxes as applicable.\n3. Subject to stock confirmation."}
              disabled={!canEdit}
              className="rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />
          </label>
        </section>

        {canEdit ? (
          <div>
            <Button type="submit" className="min-w-[160px]">
              Save Settings
            </Button>
          </div>
        ) : (
          <p className="text-xs text-amber-700">Only Super Admins can modify organizational settings.</p>
        )}
      </form>
    </>
  );
}
