"use client";
import { useEffect, useRef, useState } from "react";
import { useCart, type CartItem } from "@/context/CartContext";
import CheckoutClient from "./CheckoutClient";
import CheckoutLoading from "./CheckoutLoading";
export type OwnedCheckoutData = { token: string; id: string; orderId: string; orderNumber: string; cart: CartItem[]; details: Record<string, string>; paymentPending: boolean; savedTotal?: number; savedShippingFee?: number; expectedPaymentMinor?: number; paymentMode?: "full" | "partial_cod" };
export default function OwnedCheckout({ session }: { session: OwnedCheckoutData }) {
  const { hydrated, restoreItems } = useCart();
  const once = useRef(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"full" | "partial_cod">(() => {
    if (session.paymentMode) return session.paymentMode;
    if (typeof window !== "undefined") {
      try {
        const choice = JSON.parse(window.localStorage.getItem("hume_checkout_payment_choice_v1") || "null");
        if (choice?.sessionId === session.id && choice.mode === "partial_cod") return "partial_cod";
      } catch { /* Use the default if the saved preference is invalid. */ }
    }
    return "full";
  });
  const [switching, setSwitching] = useState(false);
  useEffect(() => {
    if (!hydrated || once.current) return;
    once.current = true;
    restoreItems(session.cart);
    let restoredDetails = session.details;
    // A quick app-router back navigation can beat the final keepalive save.
    // Use local fields only for this exact unfinished session, never an order
    // or another customer's checkout.
    if (!session.paymentPending && window.localStorage.getItem("hume_checkout_session_id") === session.id) {
      try {
        const local = JSON.parse(window.localStorage.getItem("hume_checkout_details_v1") || "{}");
        if (local && typeof local === "object" && !Array.isArray(local)) restoredDetails = { ...session.details, ...Object.fromEntries(Object.entries(local).filter((entry): entry is [string, string] => Object.hasOwn(session.details, entry[0]) && typeof entry[1] === "string")) };
      } catch { /* Keep the server snapshot if the local draft is invalid. */ }
    }
    window.localStorage.setItem("hume_checkout_session_id", session.id);
    if (session.paymentMode) window.localStorage.setItem("hume_payment_recovery_mode_v1", session.paymentMode);
    if (Object.keys(restoredDetails).length) window.localStorage.setItem("hume_checkout_details_v1", JSON.stringify(restoredDetails));
    setReady(true);
  }, [hydrated, restoreItems, session]);
  useEffect(() => { if (session.paymentMode) setMode(session.paymentMode); }, [session.paymentMode]);
  const chooseMode = async (next: "full" | "partial_cod") => {
    if (switching || next === mode) return;
    if (!session.paymentPending) {
      setMode(next);
      window.localStorage.setItem("hume_payment_recovery_mode_v1", next);
      window.localStorage.setItem("hume_checkout_payment_choice_v1", JSON.stringify({ sessionId: session.id, mode: next }));
      return;
    }
    setSwitching(true); setMessage("");
    try {
      const response = await fetch("/api/account/checkout/resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: session.orderId, paymentMode: next }), signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok || !result.path) throw new Error(result.error || "Could not change payment option");
      window.localStorage.setItem("hume_payment_recovery_mode_v1", next);
      // Reload the frozen server amount and any renewed owner capability together.
      window.location.assign(result.path);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try changing your payment option again"); }
    finally { setSwitching(false); }
  };
  if (!ready) return <CheckoutLoading title="Welcome back to checkout" description="Restoring your bag and saved details." />;
  return <>
    <aside className="mx-auto my-5 max-w-3xl rounded-2xl border border-[#ded4c1] bg-[#faf7f0] p-4 sm:p-5" aria-live="polite">
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#886d42]">Your payment options</p>
      <h2 className="mt-1 font-serif text-2xl text-[#163c2f]">Pay your way</h2>
      {message && <p role="alert" className="mt-2 text-sm text-[#61594c]">{message}</p>}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(["full", "partial_cod"] as const).filter(option => !(session.paymentPending && session.paymentMode === "partial_cod" && option === "full")).map(option => <button key={option} type="button" aria-pressed={mode === option} disabled={switching} onClick={() => void chooseMode(option)} className={`rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${mode === option ? "border-[#173e30] bg-[#173e30] text-white" : "border-[#ded4c1] bg-white text-[#302c24]"}`}><span className="block text-sm font-semibold">{option === "full" ? "Pay in full" : "20% advance + COD"}</span><span className="mt-1 block text-xs opacity-75">{option === "full" ? "UPI, cards & netbanking" : "Pay 20% now · 80% on delivery"}</span></button>)}
      </div>
      {switching && <p role="status" className="mt-2 text-sm">Updating your payment option…</p>}
    </aside>
    <CheckoutClient paymentMode={mode} paymentBlocked={switching} secureSession={{ token: session.token, id: session.id, orderId: session.orderId, orderNumber: session.orderNumber, savedTotal: session.savedTotal, savedShippingFee: session.savedShippingFee, expectedPaymentMinor: session.expectedPaymentMinor }} />
  </>;
}
