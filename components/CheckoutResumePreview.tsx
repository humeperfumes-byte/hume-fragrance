"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, type CartItem } from "@/context/CartContext";
import { readPaymentRecovery } from "@/lib/payment-recovery";
export default function CheckoutResumePreview({ restoredItems, issues, pricesChanged, token }: { restoredItems: CartItem[]; issues: string[]; pricesChanged: boolean; token: string }) {
  const cart = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function restore() {
    if (busy || issues.length) return;
    // Never substitute a different cart into an unresolved payment attempt.
    if (readPaymentRecovery(window.localStorage)) { setError("An earlier payment attempt needs checking. Return to checkout or contact HUME before restoring another cart."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/customer-checkout/restore", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }), signal: AbortSignal.timeout(15000) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to restore checkout");
      cart.restoreItems(data.items);
      for (const key of ["hume_last_order_signature_v1", "hume_last_order_id_v1", "hume_last_order_number_v1", "hume_checkout_session_id"]) window.localStorage.removeItem(key);
      // A full navigation drops the secret token URL before normal checkout analytics run.
      window.location.assign("/checkout");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to restore checkout"); setBusy(false); }
  }
  return <main className="min-h-screen bg-[#f7f7f8] px-4 py-12 text-zinc-950"><section className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-9"><Link href="/" className="text-sm font-semibold tracking-widest">HUME FRAGRANCE</Link><h1 className="text-3xl font-semibold">Continue your checkout</h1><p className="text-sm leading-6 text-zinc-600">Review your saved products below. Prices and availability have been checked again. Enter your delivery details at checkout; this link does not disclose the saved customer information.</p>{restoredItems.map((item, index) => <div key={index} className="border-b py-4"><div className="flex justify-between gap-4"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-sm text-zinc-500">{item.size} · Quantity {item.quantity}</p></div><p>₹{(item.price * item.quantity).toLocaleString("en-IN")}</p></div>{item.sampleSelections?.length ? <p className="mt-2 text-sm leading-6 text-zinc-600">Fragrances: {item.sampleSelections.map(sample => sample.name).join(", ")}</p> : null}</div>)}{pricesChanged && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Some prices have changed. The prices displayed here are current.</p>}<p className="text-sm text-zinc-600">Shipping, offers and complimentary gifts will be checked at checkout.</p>{cart.items.length > 0 && <p className="rounded-xl bg-zinc-50 p-4 text-sm">You already have products in your bag. Continuing will replace them with the products above.</p>}{issues.length > 0 && <div role="alert" className="space-y-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{issues.map((issue, index) => <p key={index}>{issue}</p>)}<Link href="/shop" className="inline-block underline">Update your products</Link></div>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button type="button" onClick={restore} disabled={busy || issues.length > 0} className="w-full rounded-full bg-black px-5 py-3 font-semibold text-white disabled:opacity-40">{busy ? "Opening checkout…" : cart.items.length ? "Replace my bag and continue" : "Restore bag and continue"}</button><button type="button" onClick={() => router.push("/checkout")} className="w-full text-sm underline">Keep my current bag</button></section></main>;
}
