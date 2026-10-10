"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CheckoutLoading from "./CheckoutLoading";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
export default function SecureCheckoutEntry() {
  const { items, hydrated } = useCart();
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!hydrated || started.current || !items.some(item => !item.isGift)) return;
    started.current = true;
    let source: Record<string, string> = {};
    try {
      const stored: unknown = JSON.parse(window.localStorage.getItem("hume_first_touch_source") || "{}");
      const limits: Record<string, number> = { source: 100, category: 50, referrerHost: 255, utmSource: 120, utmMedium: 120, utmCampaign: 180, utmTerm: 180, utmContent: 180 };
      if (stored && typeof stored === "object" && !Array.isArray(stored)) source = Object.fromEntries(Object.entries(stored).filter((entry): entry is [string, string] => entry[0] in limits && typeof entry[1] === "string").map(([key, value]) => [key, value.slice(0, limits[key])]));
    } catch { /* An attribution error cannot block checkout. */ }
    void fetch("/api/checkout-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart: items, acquisitionSource: source.source, acquisitionCategory: source.category, acquisitionReferrerHost: source.referrerHost, utmSource: source.utmSource, utmMedium: source.utmMedium, utmCampaign: source.utmCampaign, utmTerm: source.utmTerm, utmContent: source.utmContent }), signal: AbortSignal.timeout(process.env.NODE_ENV === "development" ? 60000 : 20000) })
      .then(async response => { const result = await response.json(); if (!response.ok || !result.path) throw new Error(result.error || "Could not open checkout"); router.replace(result.path); })
      .catch(error => { setError(error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name) ? "Opening checkout took too long. Your bag is preserved. Please retry safely." : error instanceof Error ? error.message : "Could not open checkout"); });
  }, [hydrated, items, router, attempt]);
  const empty = hydrated && !items.some(item => !item.isGift);
  if (!error && !empty) return <CheckoutLoading />;
  return <section className="flex min-h-[65vh] items-center justify-center bg-[#faf9f6] px-5 py-16"><div className="w-full max-w-lg rounded-[28px] border border-[#e8e4dc] bg-white p-8 text-center shadow-sm"><p className="text-[10px] uppercase tracking-[0.3em] text-[#8e8272]">HUME · CHECKOUT</p><h1 className="mt-5 font-serif text-3xl">{error ? "Let’s try that again" : "Your bag is waiting"}</h1><p role={error ? "alert" : undefined} className="mt-4 text-sm leading-6 text-muted-foreground">{error || "Add a fragrance to your bag to begin checkout."}</p>{error && <button type="button" className="mt-6 rounded-full bg-[#302b24] px-7 py-3 text-sm font-semibold text-white" onClick={() => { started.current = false; setError(""); setAttempt(value => value + 1); }}>Retry checkout</button>}<Link href="/shop" className="mt-6 block text-sm text-[#80786e] underline underline-offset-4">{error ? "Continue shopping" : "Explore fragrances"}</Link></div></section>;
}