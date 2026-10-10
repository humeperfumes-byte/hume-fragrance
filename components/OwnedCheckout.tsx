"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/context/CartContext";
import CheckoutClient from "./CheckoutClient";
import { clearPaymentRecovery } from "@/lib/payment-recovery";
export type OwnedCheckoutData = { token: string; id: string; orderId: string; orderNumber: string; cart: CartItem[]; details: Record<string, string>; paymentPending: boolean; savedTotal?: number; savedShippingFee?: number; expectedPaymentMinor?: number; paymentMode?: "full" | "partial_cod" };
export default function OwnedCheckout({ session }: { session: OwnedCheckoutData }) {
  const { hydrated, restoreItems, clearCart } = useCart();
  const once = useRef(false);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(session.paymentPending);
  const [message, setMessage] = useState("");
  const router = useRouter();
  useEffect(() => {
    if (!hydrated || once.current) return;
    once.current = true;
    restoreItems(session.cart);
    window.localStorage.setItem("hume_checkout_session_id", session.id);
    if (session.paymentMode) window.localStorage.setItem("hume_payment_recovery_mode_v1", session.paymentMode);
    if (Object.keys(session.details).length) window.localStorage.setItem("hume_checkout_details_v1", JSON.stringify(session.details));
    setReady(true);
  }, [hydrated, restoreItems, session]);
  const recover = async () => {
    setChecking(true); setMessage("");
    try {
      const response = await fetch("/api/checkout-session/recover", { method: "POST", headers: { "x-hume-checkout-token": session.token }, signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not check your payment");
      if (result.confirmed && result.orderPath) { clearCart(); clearPaymentRecovery(window.localStorage); router.replace(result.orderPath); return; }
      setMessage("Your order is saved. Payment has not been confirmed yet. Check again if you already paid; do not pay a second time.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please contact HUME to confirm your order"); }
    finally { setChecking(false); }
  };
  useEffect(() => { if (session.paymentPending) void recover(); /* One server check on opening an unresolved order. */ }, [session.token]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!ready || checking) return <p className="mx-auto max-w-xl px-6 py-24">{checking ? "Checking your existing payment…" : "Restoring your checkout…"}</p>;
  return <>{session.paymentPending && <aside className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-300 bg-amber-50 p-5"><p>{message}</p><button type="button" onClick={() => void recover()} className="mt-3 underline">Check payment again</button></aside>}<CheckoutClient secureSession={{ token: session.token, id: session.id, orderId: session.orderId, orderNumber: session.orderNumber, savedTotal: session.savedTotal, savedShippingFee: session.savedShippingFee, expectedPaymentMinor: session.expectedPaymentMinor }} /></>;
}
