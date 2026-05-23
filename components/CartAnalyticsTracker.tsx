"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const CART_SESSION_KEY = "hume_cart_session_id";
const LEAD_SESSION_KEY = "hume_checkout_session_id";
const WELCOME_BACK_REWARD_KEY = "hume_welcome_back_reward_v1";

type TrackingDetail = {
  eventType: string;
  payload?: Record<string, unknown>;
};

function getActiveWelcomeBackReward() {
  try {
    const raw = localStorage.getItem(WELCOME_BACK_REWARD_KEY);
    if (!raw) return null;
    const reward = JSON.parse(raw) as {
      code?: string;
      label?: string;
      percent?: number;
      tier?: number;
      expiresAt?: number;
    };
    if (!reward || !reward.expiresAt || reward.expiresAt <= Date.now()) return null;
    if (reward.percent !== 5 && reward.percent !== 10) return null;
    return {
      code: reward.code,
      label: reward.label,
      percent: reward.percent,
      tier: reward.tier,
      expiresAt: reward.expiresAt,
    };
  } catch {
    return null;
  }
}

function getSessionId() {
  const leadSession = localStorage.getItem(LEAD_SESSION_KEY);
  if (leadSession) {
    localStorage.setItem(CART_SESSION_KEY, leadSession);
    return leadSession;
  }

  const existing = localStorage.getItem(CART_SESSION_KEY);
  if (existing) {
    localStorage.setItem(LEAD_SESSION_KEY, existing);
    return existing;
  }

  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CART_SESSION_KEY, next);
  localStorage.setItem(LEAD_SESSION_KEY, next);
  return next;
}

function isCartEvent(eventType: string) {
  return [
    "cart_open",
    "add_to_cart",
    "update_cart_quantity",
    "remove_from_cart",
    "coupon_auto_applied",
    "reward_banner_click",
  ].includes(eventType);
}

function getCurrentCaptureUrl(pathname: string, searchParams: ReturnType<typeof useSearchParams>) {
  const pathWithQuery = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
  if (typeof window === "undefined") return pathWithQuery;
  return `${window.location.origin}${pathWithQuery}`;
}

function sendCartEvent(body: Record<string, unknown>) {
  const text = JSON.stringify(body);
  const sendBeaconFallback = () => {
    if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
    const blob = new Blob([text], { type: "application/json" });
    navigator.sendBeacon("/api/cart-events", blob);
  };

  void fetch("/api/cart-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: text,
  })
    .then((response) => {
      if (!response.ok) sendBeaconFallback();
    })
    .catch(sendBeaconFallback);
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
      const path = getCurrentCaptureUrl(pathname, searchParams);
      const payload = customEvent.detail?.payload ?? {};
      if (eventType === "cart_open" && Number(payload.itemCount || 0) <= 0) return;
      const welcomeBackReward = getActiveWelcomeBackReward();

      sendCartEvent({
        sessionId,
        eventType,
        path,
        productId: payload.productId,
        productName: payload.productName,
        price: payload.price,
        quantity: payload.quantity,
        isGift: payload.isGift,
        payload: {
          ...payload,
          siteHost: window.location.hostname,
          siteOrigin: window.location.origin,
          welcomeBackReward,
        },
      });
    };

    window.addEventListener("hume:tracking", handler as EventListener);
    return () => window.removeEventListener("hume:tracking", handler as EventListener);
  }, [pathname, searchParams]);

  return null;
}
