"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const CART_KEY = "msp_quote_cart";

export function getCart(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToCart(medicineId: string): void {
  const cart = getCart();
  if (!cart.includes(medicineId)) {
    localStorage.setItem(CART_KEY, JSON.stringify([...cart, medicineId]));
    window.dispatchEvent(new Event("msp-cart-updated"));
  }
}

export function removeFromCart(medicineId: string): void {
  const cart = getCart().filter((id) => id !== medicineId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("msp-cart-updated"));
}

export function clearCart(): void {
  localStorage.setItem(CART_KEY, JSON.stringify([]));
  window.dispatchEvent(new Event("msp-cart-updated"));
}

export function isInCart(medicineId: string): boolean {
  return getCart().includes(medicineId);
}

// ─── Add to Cart Button ──────────────────────────────────────────────────────

export function AddToCartButton({ medicineId }: { medicineId: string }) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    setInCart(isInCart(medicineId));
    const handler = () => setInCart(isInCart(medicineId));
    window.addEventListener("msp-cart-updated", handler);
    return () => window.removeEventListener("msp-cart-updated", handler);
  }, [medicineId]);

  function toggle() {
    if (inCart) {
      removeFromCart(medicineId);
    } else {
      addToCart(medicineId);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={inCart}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
        inCart
          ? "bg-teal-700 text-white hover:bg-teal-800"
          : "border border-teal-700 text-teal-700 hover:bg-teal-50"
      }`}
    >
      <ShoppingCart size={16} />
      {inCart ? "Added to quote" : "Add to quote cart"}
    </button>
  );
}

// ─── Cart Badge / floating button ───────────────────────────────────────────

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCart().length);
    const handler = () => setCount(getCart().length);
    window.addEventListener("msp-cart-updated", handler);
    return () => window.removeEventListener("msp-cart-updated", handler);
  }, []);

  if (count === 0) return null;

  return (
    <Link
      href="/request-quote?cart=1"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-teal-800 transition-colors"
    >
      <ShoppingCart size={20} />
      View quote cart
      <span className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-black text-teal-700">
        {count}
      </span>
    </Link>
  );
}

// ─── Header Cart Button ─────────────────────────────────────────────────────

export function NavCartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getCart().length);
    const handler = () => setCount(getCart().length);
    window.addEventListener("msp-cart-updated", handler);
    return () => window.removeEventListener("msp-cart-updated", handler);
  }, []);

  return (
    <Link
      href="/request-quote?cart=1"
      className="relative grid size-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-teal-700"
      aria-label={`View quote cart (${count} items)`}
      title="View quote cart"
    >
      <ShoppingCart size={19} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-teal-700 text-[10px] font-bold text-white shadow-sm">
          {count}
        </span>
      )}
    </Link>
  );
}

