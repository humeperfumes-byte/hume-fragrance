"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { detectAcquisitionSource } from "@/lib/acquisition-source";
import { isConsentTrackingEnabled } from "@/lib/consent-config";

const CONSENT_DECISION_KEY = "hume_consent_decision";
const CONSENT_SESSION_KEY = "hume_consent_session_id";
const FIRST_TOUCH_SOURCE_KEY = "hume_first_touch_source";

type TrackingDetail = {
  eventType: string;
  payload?: Record<string, unknown>;
};

function getSessionId() {
  const existing = localStorage.getItem(CONSENT_SESSION_KEY);
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CONSENT_SESSION_KEY, next);
  return next;
}

export default function ConsentTimelineTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string | null>(null);

  const sendEvent = async (eventType: string, payload?: Record<string, unknown>) => {
    try {
      if (!isConsentTrackingEnabled) return;
      if (localStorage.getItem(CONSENT_DECISION_KEY) !== "allow") return;

      const sessionId = getSessionId();
      const pathWithQuery = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
      await fetch("/api/consent-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId,
          path: pathWithQuery,
          eventType,
          language: navigator.language || undefined,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
          payload,
        }),
      });
    } catch (error) {
      console.error("Timeline tracking failed:", error);
    }
  };

  useEffect(() => {
    if (!isConsentTrackingEnabled) return;

    const toPath = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    const fromPath = previousPathRef.current;
    previousPathRef.current = toPath;
    const utmSource = searchParams?.get("utm_source");
    const utmMedium = searchParams?.get("utm_medium");
    const utmCampaign = searchParams?.get("utm_campaign");
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const acquisition = detectAcquisitionSource({ utmSource, referrer });

    try {
      if (typeof window !== "undefined" && !window.localStorage.getItem(FIRST_TOUCH_SOURCE_KEY)) {
        window.localStorage.setItem(
          FIRST_TOUCH_SOURCE_KEY,
          JSON.stringify({
            source: acquisition.source,
            category: acquisition.category,
            referrerHost: acquisition.referrerHost,
            capturedAt: new Date().toISOString(),
          }),
        );
      }
    } catch (error) {
      console.error("Failed to persist first-touch source:", error);
    }

    void sendEvent("page_view", {
      fromPath,
      toPath,
      source: acquisition.source,
      sourceCategory: acquisition.category,
      referrer,
      referrerHost: acquisition.referrerHost,
      utmSource: utmSource || undefined,
      utmMedium: utmMedium || undefined,
      utmCampaign: utmCampaign || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isConsentTrackingEnabled) return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<TrackingDetail>;
      if (!customEvent.detail?.eventType) return;
      void sendEvent(customEvent.detail.eventType, customEvent.detail.payload);
    };

    window.addEventListener("hume:tracking", handler as EventListener);
    return () => window.removeEventListener("hume:tracking", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}
