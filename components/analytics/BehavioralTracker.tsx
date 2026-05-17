"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const BATCH_FLUSH_INTERVAL = 30000;
const ANALYTICS_SESSION_KEY = "hume_analytics_sid";
const CART_SESSION_KEY = "hume_cart_session_id";
const CHECKOUT_SESSION_KEY = "hume_checkout_session_id";
const CONSENT_SESSION_KEY = "hume_consent_session_id";
const INTENT_STORAGE_KEY = "hume_behavior_intent_unlocked";

const INTENT_EVENT_TYPES = new Set([
  "add_to_cart",
  "cart_open",
  "update_cart_quantity",
  "remove_from_cart",
  "coupon_auto_applied",
  "checkout_started",
  "coupon_requested",
  "coupon_sent",
]);

type AnalyticsEvent = {
  eventType: string;
  path: string;
  elementId?: string;
  elementText?: string;
  sectionName?: string;
  payload?: Record<string, unknown>;
};

export function BehavioralTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const intentUnlockedRef = useRef(false);
  const trackedFormFields = useRef<Set<string>>(new Set());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getSharedSessionId = useCallback(() => {
    const existing =
      localStorage.getItem(CART_SESSION_KEY) ||
      localStorage.getItem(CHECKOUT_SESSION_KEY) ||
      localStorage.getItem(CONSENT_SESSION_KEY) ||
      localStorage.getItem(ANALYTICS_SESSION_KEY);

    const sid = existing || self.crypto.randomUUID();
    localStorage.setItem(ANALYTICS_SESSION_KEY, sid);
    localStorage.setItem(CART_SESSION_KEY, sid);
    localStorage.setItem(CHECKOUT_SESSION_KEY, sid);
    localStorage.setItem(CONSENT_SESSION_KEY, sid);
    return sid;
  }, []);

  const queueEvent = useCallback((event: AnalyticsEvent) => {
    if (!intentUnlockedRef.current) return;
    eventQueue.current.push(event);
  }, []);

  const flushEvents = useCallback(async () => {
    if (eventQueue.current.length === 0) return;
    const batch = [...eventQueue.current];
    eventQueue.current = [];

    try {
      await fetch("/api/analytics/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          events: batch,
        }),
      });
    } catch {
      eventQueue.current.unshift(...batch);
    }
  }, []);

  const unlockIntent = useCallback(
    (eventType: string, payload?: Record<string, unknown>) => {
      sessionIdRef.current = sessionIdRef.current || getSharedSessionId();
      localStorage.setItem(INTENT_STORAGE_KEY, "true");
      intentUnlockedRef.current = true;
      eventQueue.current.push({
        eventType,
        path: pathname,
        payload: {
          ...(payload || {}),
          intentUnlockedBy: eventType,
          intentMode: "cart_intent",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
          language: navigator.language || undefined,
        },
      });
    },
    [getSharedSessionId, pathname]
  );

  useEffect(() => {
    sessionIdRef.current = getSharedSessionId();
    trackedFormFields.current.clear();

    const storedIntent = localStorage.getItem(INTENT_STORAGE_KEY) === "true";
    intentUnlockedRef.current = storedIntent;

    if (storedIntent) {
      eventQueue.current.push({
        eventType: "page_view",
        path: pathname,
        payload: {
          intentMode: "cart_intent",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
          language: navigator.language || undefined,
        },
      });
    }
  }, [getSharedSessionId, pathname]);

  useEffect(() => {
    const handleTrackingEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{
        eventType?: string;
        payload?: Record<string, unknown>;
      }>;
      const eventType = customEvent.detail?.eventType;
      if (!eventType || !INTENT_EVENT_TYPES.has(eventType)) return;
      if (eventType === "cart_open" && Number(customEvent.detail?.payload?.itemCount || 0) <= 0) return;
      unlockIntent(eventType, customEvent.detail?.payload);
    };

    window.addEventListener("hume:tracking", handleTrackingEvent as EventListener);
    return () => window.removeEventListener("hume:tracking", handleTrackingEvent as EventListener);
  }, [unlockIntent]);

  useEffect(() => {
    flushTimerRef.current = setInterval(flushEvents, BATCH_FLUSH_INTERVAL);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        queueEvent({ eventType: "exit_intent", path: pathname, payload: { cause: "mouse_leave_top" } });
        void flushEvents();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      const batch = [...eventQueue.current];
      if (batch.length === 0) return;
      eventQueue.current = [];
      navigator.sendBeacon(
        "/api/analytics/behavior",
        JSON.stringify({ sessionId: sessionIdRef.current, events: batch })
      );
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      void flushEvents();
    };
  }, [flushEvents, pathname, queueEvent]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("button, a, [data-analytics-click]");
      if (!clickable) return;

      queueEvent({
        eventType: "click",
        path: pathname,
        elementId: clickable.id || undefined,
        elementText: clickable.textContent?.substring(0, 50) || undefined,
        sectionName:
          clickable.closest("[data-analytics-section]")?.getAttribute("data-analytics-section") || undefined,
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, queueEvent]);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) return;

      const fieldId = target.name || target.id || target.type;
      if (trackedFormFields.current.has(fieldId)) return;
      trackedFormFields.current.add(fieldId);

      queueEvent({
        eventType: "form_focus",
        path: pathname,
        elementId: fieldId,
        sectionName:
          target.closest("[data-analytics-section]")?.getAttribute("data-analytics-section") || undefined,
      });
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [pathname, queueEvent]);

  return null;
}
