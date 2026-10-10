"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  return <section className="mx-auto min-h-[50vh] max-w-xl px-5 py-20 text-center"><h1 className="text-3xl font-serif">Checkout</h1>{error ? <><p role="alert" className="mt-5">{error}</p><button type="button" className="mt-5 rounded-full bg-black px-6 py-3 text-white" onClick={() => { started.current = false; setError(""); setAttempt(value => value + 1); }}>Retry safely</button></> : <p className="mt-5">{hydrated && !items.some(item => !item.isGift) ? "Your bag is empty." : "Opening your secure checkout…"}</p>}<Link href="/shop" className="mt-6 inline-block underline">Continue shopping</Link></section>;
}
