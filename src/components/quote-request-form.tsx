"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Minus, Plus, Search, ShoppingCart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createQuoteRequest, type QuoteRequestActionState } from "@/features/quote-requests/actions";
import type { CatalogueMedicine } from "@/features/catalogue/queries";
import { formatInr } from "@/lib/money";
import { getCart, clearCart } from "@/components/quote-cart";

const initialState: QuoteRequestActionState = { ok: false };

export function QuoteRequestForm({
  medicines,
  preselectedMedicineId,
  loadCart = false
}: {
  medicines: CatalogueMedicine[];
  preselectedMedicineId?: string;
  loadCart?: boolean;
}) {
  const [items, setItems] = useState<Record<string, number>>(() =>
    preselectedMedicineId ? { [preselectedMedicineId]: 1 } : {}
  );
  const [search, setSearch] = useState("");
  const [state, action, pending] = useActionState(createQuoteRequest, initialState);
  const cartLoadedRef = useRef(false);

  // Load items from localStorage cart when ?cart=1
  useEffect(() => {
    if (!loadCart || cartLoadedRef.current) return;
    cartLoadedRef.current = true;
    const cartIds = getCart();
    if (cartIds.length > 0) {
      const initial: Record<string, number> = {};
      cartIds.forEach((id) => { initial[id] = 1; });
      setItems(initial);
    }
  }, [loadCart]);

  const selected = useMemo(
    () =>
      medicines
        .filter((medicine) => items[medicine.id])
        .map((medicine) => ({ medicineId: medicine.id, quantity: items[medicine.id] })),
    [items, medicines]
  );

  const updateItem = (id: string, quantity: number) =>
    setItems((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = Math.min(quantity, 10_000);
      return next;
    });

  const filteredMedicines = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return medicines;
    return medicines.filter(
      (m) =>
        m.productName.toLowerCase().includes(term) ||
        m.genericName?.toLowerCase().includes(term) ||
        m.manufacturer?.toLowerCase().includes(term) ||
        m.strength?.toLowerCase().includes(term)
    );
  }, [medicines, search]);

  // On successful submission, clear the cart
  useEffect(() => {
    if (state.ok) clearCart();
  }, [state.ok]);

  if (state.ok)
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
        <CheckCircle2 className="mx-auto text-teal-700" size={38} />
        <h2 className="mt-4 font-serif text-3xl font-bold text-blue-950">Request received</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-700">
          Thank you. Your reference is <strong>{state.reference}</strong>. The sales team will
          review your commercial requirements and contact you using the details provided.
        </p>
      </div>
    );

  return (
    <form action={action} className="grid gap-8">
      <input type="hidden" name="items" value={JSON.stringify(selected)} />

      {/* ── Section 01: Products ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-teal-700">01 — PRODUCTS</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-blue-950">
              Select your requirement
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {selected.length} selected
          </span>
        </div>

        {/* Cart notice */}
        {loadCart && selected.length > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
            <ShoppingCart size={16} className="shrink-0" />
            <span>
              {selected.length} {selected.length === 1 ? "medicine" : "medicines"} loaded from your
              quote cart. Adjust quantities below.
            </span>
          </div>
        )}

        {/* Search within medicines list */}
        {medicines.length > 8 && (
          <label className="mt-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Filter medicines…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}

        {medicines.length ? (
          <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {filteredMedicines.map((medicine) => {
              const quantity = items[medicine.id] ?? 0;
              return (
                <div
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={medicine.id}
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-teal-700"
                      checked={quantity > 0}
                      onChange={(event) => updateItem(medicine.id, event.target.checked ? 1 : 0)}
                    />
                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        {medicine.productName}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {[medicine.strength, medicine.packSize, medicine.manufacturer]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                      {medicine.unitPrice && (
                        <span className="mt-1 block text-xs font-semibold text-teal-700">
                          {formatInr(Number(medicine.unitPrice))}
                        </span>
                      )}
                    </span>
                  </label>
                  {quantity > 0 && (
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => updateItem(medicine.id, quantity - 1)}
                        className="grid size-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:border-teal-700 hover:text-teal-700"
                        aria-label={`Reduce ${medicine.productName} quantity`}
                      >
                        <Minus size={15} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItem(medicine.id, quantity + 1)}
                        className="grid size-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:border-teal-700 hover:text-teal-700"
                        aria-label={`Increase ${medicine.productName} quantity`}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredMedicines.length === 0 && (
              <p className="p-5 text-sm text-slate-500">No medicines match your filter.</p>
            )}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            No medicines are published yet. Contact the sales team with your product list until the
            catalogue is ready.
          </p>
        )}
        {state.fieldErrors?.items && (
          <p className="mt-3 text-sm font-medium text-red-700">{state.fieldErrors.items[0]}</p>
        )}
      </section>

      {/* ── Section 02: Business details ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">02 — BUSINESS DETAILS</p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-blue-950">
          Tell us where to send the quotation
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["businessName", "Business name", "text"],
              ["contactName", "Your name", "text"],
              ["email", "Work email", "email"],
              ["phone", "Phone number", "tel"],
              ["gstin", "GSTIN (optional)", "text"],
              ["postalCode", "6-digit PIN code", "text"],
              ["city", "City", "text"],
              ["state", "State", "text"]
            ] as [string, string, string][]
          ).map(([name, label, type]) => (
            <label key={name} className="grid gap-1.5 text-sm font-semibold text-slate-700">
              {label}
              <input
                name={name}
                type={type}
                maxLength={name === "gstin" ? 15 : undefined}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
              {state.fieldErrors?.[name] && (
                <span className="text-xs font-medium text-red-700">
                  {state.fieldErrors[name][0]}
                </span>
              )}
            </label>
          ))}
        </div>
        <label className="mt-4 grid gap-1.5 text-sm font-semibold text-slate-700">
          Business address
          <textarea
            name="address"
            rows={3}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
          {state.fieldErrors?.address && (
            <span className="text-xs font-medium text-red-700">
              {state.fieldErrors.address[0]}
            </span>
          )}
        </label>
        <label className="mt-4 grid gap-1.5 text-sm font-semibold text-slate-700">
          Commercial notes <span className="font-normal text-slate-400">optional</span>
          <textarea
            name="notes"
            rows={3}
            maxLength={2000}
            placeholder="Add quantities, delivery requirements, or an existing reference. Do not include patient information."
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
          />
        </label>
      </section>

      {/* ── Section 03: Consent + submit ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="flex gap-3 text-sm leading-6 text-slate-600">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={19} />
          We use these business details solely to evaluate and respond to this B2B commercial
          request. Do not share patient or prescription information.
        </p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm font-medium text-slate-700">
          <input type="checkbox" name="consent" className="mt-1 size-4 accent-teal-700" required />
          I confirm I am submitting a business enquiry and agree to the{" "}
          <a href="/legal/privacy" className="underline decoration-teal-400 underline-offset-2">
            privacy notice
          </a>
          .
        </label>
        {state.error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          className="mt-6 w-full sm:w-auto"
          disabled={pending || selected.length === 0}
        >
          {pending ? "Submitting request…" : "Submit quotation request"}
        </Button>
      </section>
    </form>
  );
}
