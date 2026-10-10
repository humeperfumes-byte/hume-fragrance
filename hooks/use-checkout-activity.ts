"use client";
import { useCallback, useEffect, useRef } from "react";
import type { CheckoutEvent, ExitReason } from "@/lib/checkout-activity";
export function useCheckoutActivity(token?: string, paused = false) {
  const queue = useRef<Array<{ event: CheckoutEvent; reason?: ExitReason }>>([]);
  const pausedRef = useRef(paused);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flush = useCallback((leaving = false) => {
    if (!token || (!leaving && pausedRef.current) || !queue.current.length) return;
    const events = queue.current.splice(0, 20);
    try {
      void fetch("/api/checkout-session/activity", { method: "POST", headers: { "Content-Type": "application/json", "x-hume-checkout-token": token }, body: JSON.stringify({ events }), keepalive: true, signal: AbortSignal.timeout(5000) }).catch(() => {});
    } catch { /* Activity must never interrupt checkout. */ }
  }, [token]);
  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) {
      const pending = setTimeout(() => flush(), 1000);
      return () => clearTimeout(pending);
    }
  }, [paused, flush]);
  const record = useCallback((event: CheckoutEvent, reason?: ExitReason) => {
    if (!token) return;
    queue.current.push({ event, ...(reason ? { reason } : {}) });
    if (queue.current.length > 20) queue.current.shift();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(), 1000);
  }, [token, flush]);
  useEffect(() => {
    if (!token) return;
    record("opened");
    const hide = () => { record("page_hidden"); flush(true); };
    const visibility = () => { if (document.visibilityState === "hidden") hide(); };
    const navigation = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") as HTMLAnchorElement | null : null;
      if (link && !event.ctrlKey && !event.metaKey && !event.shiftKey && link.target !== "_blank" && new URL(link.href).pathname !== window.location.pathname) record("navigation_requested");
    };
    const historyNavigation = () => record("navigation_requested");
    window.addEventListener("pagehide", hide);
    window.addEventListener("popstate", historyNavigation);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", navigation);
    return () => { window.removeEventListener("pagehide", hide); window.removeEventListener("popstate", historyNavigation); document.removeEventListener("visibilitychange", visibility); document.removeEventListener("click", navigation); if (timer.current) clearTimeout(timer.current); flush(true); };
  }, [token, record, flush]);
  return record;
}
