"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, CreditCard, ShieldCheck, ShoppingBag, X } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatINR } from "@/lib/currency";
import {
  PAYMENT_RECOVERY_EVENT,
  PAYMENT_RECOVERY_MODE_KEY,
  readPaymentRecovery,
  type PaymentRecovery,
  type RecoveryPaymentMode,
} from "@/lib/payment-recovery";

export default function PaymentRecoveryPrompt() {
  const router = useRouter();
  const pathname = usePathname();
  const [recovery, setRecovery] = useState<PaymentRecovery | null>(null);
  const [open, setOpen] = useState(false);
  const [badgeHiddenUntilRefresh, setBadgeHiddenUntilRefresh] = useState(false);
  const [catalogImages, setCatalogImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const refresh = () => setRecovery(readPaymentRecovery(window.localStorage));
    refresh();
    window.addEventListener(PAYMENT_RECOVERY_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PAYMENT_RECOVERY_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!open || !recovery) return;
    const savedItems = recovery.items?.length
      ? recovery.items
      : (() => {
          try {
            const parsed = JSON.parse(window.localStorage.getItem("hume_cart_v2") || "[]") as PaymentRecovery["items"];
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })();
    const productIds = Array.from(new Set(savedItems.filter((item) => !item.isGift).map((item) => item.id)));
    if (!productIds.length) return;

    let cancelled = false;
    void Promise.all(
      productIds.map(async (id) => {
        try {
          const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
          if (!response.ok) return null;
          const product = (await response.json()) as { images?: string[] };
          return product.images?.[0] ? ([id, product.images[0]] as const) : null;
        } catch {
          return null;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setCatalogImages(Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => Boolean(entry))));
    });

    return () => {
      cancelled = true;
    };
  }, [open, recovery]);

  if (!recovery || pathname.startsWith("/admin") || pathname === "/checkout" || pathname.startsWith("/order-success")) return null;

  const continueWith = (mode: RecoveryPaymentMode) => {
    window.localStorage.setItem(PAYMENT_RECOVERY_MODE_KEY, mode);
    router.push("/checkout");
  };

  const recoveryItems = (() => {
    if (recovery.items?.length) return recovery.items;
    try {
      const cartItems = JSON.parse(window.localStorage.getItem("hume_cart_v2") || "[]") as PaymentRecovery["items"];
      return Array.isArray(cartItems) ? cartItems : [];
    } catch {
      return [];
    }
  })();

  return (
    <>
      {!badgeHiddenUntilRefresh ? (
      <motion.button type="button" onClick={() => { setBadgeHiddenUntilRefresh(true); setOpen(true); }} animate={{ x: [0, 5, 0], boxShadow: ["0 14px 38px rgba(6,58,39,.25)", "0 18px 52px rgba(197,157,78,.38)", "0 14px 38px rgba(6,58,39,.25)"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} whileHover={{ y: -4, scale: 1.02 }} className="group fixed bottom-24 right-3 z-[60] overflow-hidden rounded-2xl border border-[#d9b866]/80 bg-[linear-gradient(125deg,#082c21_0%,#10533b_54%,#1b7250_100%)] px-3.5 py-3 text-left text-white sm:bottom-8 sm:right-6 sm:min-w-[210px] sm:px-4" aria-label="Complete pending order">
        <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full border border-[#f0cd87]/20" />
        <span className="pointer-events-none absolute -right-2 -top-2 h-12 w-12 rounded-full bg-[#e4bd72]/10 blur-lg" />
        <span className="relative flex items-center gap-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f0cd87]/45 bg-[#f0cd87]/10 text-[#f0cd87]">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#55231d] bg-[#ffcf69]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[8px] font-semibold uppercase tracking-[.2em] text-[#e7c47e]">Payment pending</span>
            <span className="mt-0.5 flex items-center gap-1 font-serif text-base leading-none">Complete your order <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}><ChevronRight className="h-3.5 w-3.5" /></motion.span></span>
          </span>
        </span>
      </motion.button>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-[#fffdf8] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#9b5f33]">Payment incomplete</p><h2 className="mt-2 font-serif text-3xl">Your order is waiting</h2></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-black/10 p-2"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/55">Order {recovery.orderNumber} • {formatINR(recovery.grandTotal)}</p>
            {recoveryItems.length ? (
              <div className="mt-4 max-h-[210px] space-y-2 overflow-y-auto rounded-2xl border border-black/8 bg-[#f7f2ea] p-2.5">
                {recoveryItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-[0_5px_16px_rgba(40,24,17,.05)]">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#eee8df]">
                      <ImageWithFallback src={catalogImages[item.id] || item.image || "/images/logo.png"} fallbackSrc="/images/logo.png" alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base leading-tight text-[#281712]">{item.name}</p>
                      <p className="mt-1 truncate text-[10px] text-black/45">
                        {[item.inspiration ? `Inspired by ${item.inspiration}` : null, item.size, `Qty ${item.quantity}`].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold ${item.isGift ? "text-emerald-700" : "text-[#281712]"}`}>
                      {item.isGift ? "FREE" : formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-5 space-y-3">
              <button type="button" onClick={() => continueWith("partial_cod")} className="flex w-full items-center gap-3 rounded-2xl border border-[#d7b76e] bg-[#fff7df] p-4 text-left">
                <ShieldCheck className="h-5 w-5 text-[#7b5a13]" /><span className="flex-1"><strong className="block text-sm">Pay 20% now + COD</strong><span className="mt-1 block text-xs text-black/50">Pay {formatINR(Math.round(recovery.grandTotal * .2))} now; the remaining 80% is due on delivery.</span></span><ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => continueWith("full")} className="group flex min-h-16 w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#6faa8b] bg-[linear-gradient(115deg,#0d3b2c_0%,#176447_52%,#26835c_100%)] p-4 text-left text-white shadow-[0_12px_28px_rgba(13,77,52,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(13,77,52,.3)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10"><CreditCard className="h-4.5 w-4.5 text-[#d9f2df]" /></span><strong className="flex-1 text-sm tracking-[.01em]">Pay complete amount</strong><ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
