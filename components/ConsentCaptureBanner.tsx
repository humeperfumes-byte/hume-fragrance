"use client";

import { useEffect } from "react";
import { isConsentTrackingEnabled } from "@/lib/consent-config";

const CONSENT_DECISION_KEY = "hume_consent_decision";
const CONSENT_SESSION_KEY = "hume_consent_session_id";

function getOrCreateSessionId() {
  const existing = localStorage.getItem(CONSENT_SESSION_KEY);
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CONSENT_SESSION_KEY, next);
  return next;
}

export default function ConsentCaptureBanner() {
  useEffect(() => {
    if (!isConsentTrackingEnabled) return;

    const current = localStorage.getItem(CONSENT_DECISION_KEY);
    if (current === "allow") return;

    const capture = async () => {
      try {
        localStorage.setItem(CONSENT_DECISION_KEY, "allow");
        const sessionId = getOrCreateSessionId();

        await fetch("/api/consent-capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "allow",
            sessionId,
            path: window.location.pathname,
            referrer: document.referrer || undefined,
            language: navigator.language || undefined,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || undefined,
            platform:
              ((navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData
                ?.platform as string | undefined) ||
              navigator.platform ||
              undefined,
            screenWidth: window.screen?.width || undefined,
            screenHeight: window.screen?.height || undefined,
            cookieEnabled: navigator.cookieEnabled,
            data: {
              pathWithQuery: window.location.pathname + window.location.search,
            },
          }),
        });
      } catch (error) {
        console.error("Consent capture failed:", error);
      }
    };

    capture();
  }, []);

  return null;
}
