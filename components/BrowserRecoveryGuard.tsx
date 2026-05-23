"use client";

import { useEffect } from "react";

const RECOVERY_VERSION = "2026-05-24-domain-cache-recovery-1";
const RECOVERY_KEY = "hume:browser-recovery-version";
const RECOVERY_PARAM = "hume_recovery";
const SESSION_CACHE_KEYS = ["hume:products:public:v1"];

async function clearOriginRuntimeCaches() {
  const tasks: Array<Promise<unknown>> = [];

  try {
    for (const key of SESSION_CACHE_KEYS) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Storage can be blocked in some browsers.
  }

  try {
    if ("caches" in window) {
      tasks.push(
        window.caches.keys().then((keys) => Promise.all(keys.map((key) => window.caches.delete(key)))),
      );
    }
  } catch {
    // Cache Storage is best-effort only.
  }

  try {
    if ("serviceWorker" in navigator) {
      tasks.push(
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister()))),
      );
    }
  } catch {
    // Service workers may be unavailable or blocked.
  }

  await Promise.allSettled(tasks);
}

export default function BrowserRecoveryGuard() {
  useEffect(() => {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.searchParams.get(RECOVERY_PARAM) === RECOVERY_VERSION) {
      currentUrl.searchParams.delete(RECOVERY_PARAM);
      window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      return;
    }

    try {
      if (window.localStorage.getItem(RECOVERY_KEY) === RECOVERY_VERSION) return;
      window.localStorage.setItem(RECOVERY_KEY, RECOVERY_VERSION);
    } catch {
      return;
    }

    void clearOriginRuntimeCaches().finally(() => {
      const reloadUrl = new URL(window.location.href);
      reloadUrl.searchParams.set(RECOVERY_PARAM, RECOVERY_VERSION);
      window.location.replace(reloadUrl.toString());
    });
  }, []);

  return null;
}
