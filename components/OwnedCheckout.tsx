"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/context/CartContext";
import CheckoutClient from "./CheckoutClient";
import CheckoutLoading from "./CheckoutLoading";
import { clearPaymentRecovery } from "@/lib/payment-recovery";
export type OwnedCheckoutData = { token: string; id: string; orderId: string; orderNumber: string; cart: CartItem[]; details: Record<string, string>; paymentPending: boolean; savedTotal?: number; savedShippingFee?: number; expectedPaymentMinor?: number; paymentMode?: "full" | "partial_cod" };
export default function OwnedCheckout({ session }: { session: OwnedCheckoutData }) {
  const { hydrated, restoreItems, clearCart } = useCart();
  const once = useRef(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(session.paymentPending);
  const [message, setMessage] = useState("");
  const [paymentState, setPaymentState] = useState<"draft" | "unpaid" | "processing" | "unknown">(session.paymentPending ? "unknown" : "draft");
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
  const router = useRouter();
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
  const recover = async () => {
    setChecking(true); setMessage("");
    try {
      const response = await fetch("/api/checkout-session/recover", { method: "POST", headers: { "x-hume-checkout-token": session.token }, signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not check your payment");
      if (result.confirmed && result.orderPath) { clearCart(); clearPaymentRecovery(window.localStorage); router.replace(result.orderPath); return; }
      setPaymentState(result.canPay === true ? (result.state === "draft" ? "draft" : "unpaid") : "processing");
      setMessage(result.canPay === true ? "Your order is saved. Choose how you’d like to pay below." : "Your payment is still being checked. Please wait before trying another payment.");
    } catch (error) { setPaymentState("unknown"); setMessage(error instanceof Error ? error.message : "Please contact HUME to confirm your order"); }
    finally { setChecking(false); }
  };
  useEffect(() => { if (session.paymentPending) void recover(); /* One server check on opening an unresolved order. */ }, [session.token]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (session.paymentMode) setMode(session.paymentMode); }, [session.paymentMode]);
  useEffect(() => {
    if (paymentState !== "processing") return;
    const timer = window.setTimeout(() => { if (document.visibilityState === "visible") void recover(); }, 10000);
    return () => window.clearTimeout(timer);
  }, [paymentState, checking]); // eslint-disable-line react-hooks/exhaustive-deps
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
    } catch (error) { setPaymentState("unknown"); setMessage(error instanceof Error ? error.message : "Please check your saved payment"); }
    finally { setSwitching(false); }
  };
  if (!ready || checking) return <CheckoutLoading title={checking ? "Checking your saved payment" : "Welcome back to checkout"} description={checking ? "Confirming the status of your existing payment. Please wait before trying again." : "Restoring your bag and saved details."} />;
  const blocked = paymentState === "processing" || paymentState === "unknown";
  return <>
    <aside className="mx-auto my-5 max-w-3xl rounded-2xl border border-[#ded4c1] bg-[#faf7f0] p-4 sm:p-5" aria-live="polite">
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#886d42]">{blocked ? "Payment status" : "Your payment options"}</p>
      <h2 className="mt-1 font-serif text-2xl text-[#163c2f]">{blocked ? "Let’s check your payment" : "Pay your way"}</h2>
      {message && <p className="mt-2 text-sm text-[#61594c]">{message}</p>}
      {blocked ? <div className="mt-3 flex flex-wrap items-center gap-4"><button type="button" onClick={() => void recover()} className="rounded-full bg-[#173e30] px-4 py-2 text-sm font-semibold text-white">Check payment status</button><a href="https://wa.me/919559024822" target="_blank" rel="noreferrer" className="text-sm text-[#173e30] underline">Contact HUME</a></div> : <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(["full", "partial_cod"] as const).filter(option => !(session.paymentPending && session.paymentMode === "partial_cod" && option === "full")).map(option => <button key={option} type="button" aria-pressed={mode === option} disabled={switching} onClick={() => void chooseMode(option)} className={`rounded-xl border px-4 py-3 text-left transition disabled:opacity-50 ${mode === option ? "border-[#173e30] bg-[#173e30] text-white" : "border-[#ded4c1] bg-white text-[#302c24]"}`}><span className="block text-sm font-semibold">{option === "full" ? "Pay in full" : "20% advance + COD"}</span><span className="mt-1 block text-xs opacity-75">{option === "full" ? "UPI, cards & netbanking" : "Pay 20% now · 80% on delivery"}</span></button>)}
      </div>}
      {switching && <p className="mt-2 text-sm">Checking earlier payment before changing your option…</p>}
    </aside>
    <CheckoutClient paymentMode={mode} paymentBlocked={blocked || switching} secureSession={{ token: session.token, id: session.id, orderId: session.orderId, orderNumber: session.orderNumber, savedTotal: session.savedTotal, savedShippingFee: session.savedShippingFee, expectedPaymentMinor: session.expectedPaymentMinor }} />
  </>;
}
