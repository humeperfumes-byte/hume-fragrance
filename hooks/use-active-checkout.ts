"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CHECKOUT_CONTINUATION_EVENT, type ActiveCheckout } from "@/lib/checkout-continuation";
import { clearPaymentRecovery, readPaymentRecovery } from "@/lib/payment-recovery";

export function useActiveCheckout() {
  const pathname = usePathname();
  const [checkout, setCheckout] = useState<ActiveCheckout | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout") || pathname.startsWith("/order/")) return;
    let cancelled = false;
    const controller = new AbortController();
    let pending = false;
    const refresh = async () => {
      if (pending || cancelled) return;
      pending = true;
      try {
        const response = await fetch("/api/checkout-session/active", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const result = await response.json();
        if (!cancelled && result.closedOrderId && readPaymentRecovery(window.localStorage)?.orderId === result.closedOrderId) clearPaymentRecovery(window.localStorage);
        if (!cancelled) { setCheckout(result.checkout || null); setLoaded(true); }
      } catch { /* Preserve the last known reminder on a transient network failure. */ }
      finally { pending = false; }
    };
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    window.addEventListener(CHECKOUT_CONTINUATION_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; controller.abort(); window.removeEventListener(CHECKOUT_CONTINUATION_EVENT, refresh); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", onVisible); };
  }, [pathname]);
  return { checkout, loaded };
}
