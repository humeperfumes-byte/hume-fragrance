"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
export default function SharedCheckoutSelection({ items, issues }: { items: CartItem[]; issues: string[] }) {
  const cart = useCart();
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const start = async () => {
    if (busy || issues.length) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart: items }), signal: AbortSignal.timeout(20000) });
      const result = await response.json();
      if (!response.ok || !result.path) throw new Error(result.error || "Could not restore selection");
      cart.restoreItems(items);
      window.location.assign(result.path);
    } catch (error) { setError(error instanceof Error ? error.message : "Please retry"); setBusy(false); }
  };
  return <main className="mx-auto max-w-xl space-y-5 px-5 py-20"><h1 className="text-2xl font-semibold">Continue your HUME selection</h1><p>This checkout belongs to another browser. Only the products can be restored here. Your contact details, address and payment remain private.</p><ul className="space-y-2">{items.map(item => <li key={item.id}>{item.name} · Quantity {item.quantity}</li>)}</ul>{issues.map(issue => <p key={issue} className="text-amber-800">{issue}</p>)}{error && <p role="alert">{error}</p>}<button type="button" disabled={busy || !!issues.length} onClick={() => void start()} className="rounded-full bg-black px-6 py-3 text-white disabled:opacity-50">{busy ? "Opening checkout…" : cart.items.length ? "Replace my bag with this selection" : "Use this selection"}</button><p><Link href="/shop" className="underline">Shop perfumes</Link></p></main>;
}
