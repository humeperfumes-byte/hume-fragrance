"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const CART_SESSION_KEY = "hume_cart_session_id";

type TrackingDetail = {
  eventType: string;
  payload?: Record<string, unknown>;
};

function getSessionId() {
  const existing = localStorage.getItem(CART_SESSION_KEY);
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CART_SESSION_KEY, next);
  return next;
}

function isCartEvent(eventType: string) {
  return [
    "cart_open",
    "add_to_cart",
    "update_cart_quantity",
    "remove_from_cart",
  ].includes(eventType);
}

export default function CartAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<TrackingDetail>;
      const eventType = customEvent.detail?.eventType;
      if (!eventType || !isCartEvent(eventType)) return;

      const sessionId = getSessionId();
      const path = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
      const payload = customEvent.detail?.payload ?? {};

      void fetch("/api/cart-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId,
          eventType,
          path,
          productId: payload.productId,
          productName: payload.productName,
          price: payload.price,
          quantity: payload.quantity,
          isGift: payload.isGift,
          payload,
        }),
      });
    };

    window.addEventListener("hume:tracking", handler as EventListener);
    return () => window.removeEventListener("hume:tracking", handler as EventListener);
  }, [pathname, searchParams]);

  return null;
}

