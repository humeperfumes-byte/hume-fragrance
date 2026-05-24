"use client";

import { useEffect } from "react";

const RECOVERY_VERSION = "2026-05-24-com-hard-browser-recovery-2";
const RECOVERY_KEY = "hume:browser-recovery-version";
const RECOVERY_PARAM = "hume_recovery";

function shouldRunRecoveryOnThisHost() {
  const hostname = window.location.hostname.replace(/^www\./, "");
  return hostname === "humefragrance.com";
}

function getCookieDeleteDomains() {
  const hostname = window.location.hostname;
  const baseDomain = hostname.replace(/^www\./, "");

  return Array.from(
    new Set([
      "",
      hostname,
      `.${hostname}`,
      baseDomain,
      `.${baseDomain}`,
    ]),
  );
}

function expireAccessibleCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter(Boolean);

  const paths = ["/", window.location.pathname || "/"];
  const domains = getCookieDeleteDomains();

  for (const name of cookieNames) {
    for (const path of paths) {
      for (const domain of domains) {
        const domainPart = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=${path}${domainPart}; SameSite=Lax`;
      }
    }
  }
}

function clearWebStorage() {
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.localStorage.setItem(RECOVERY_KEY, RECOVERY_VERSION);
}

async function clearOriginRuntimeCaches() {
  const tasks: Array<Promise<unknown>> = [];

  try {
    clearWebStorage();
  } catch {
    // Storage can be blocked in some browsers.
  }

  try {
    expireAccessibleCookies();
  } catch {
    // HttpOnly cookies cannot be removed from client code.
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
    if (!shouldRunRecoveryOnThisHost()) return;

    const currentUrl = new URL(window.location.href);

    if (currentUrl.searchParams.get(RECOVERY_PARAM) === RECOVERY_VERSION) {
      currentUrl.searchParams.delete(RECOVERY_PARAM);
      window.history.replaceState(null, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      return;
    }

    try {
      if (window.localStorage.getItem(RECOVERY_KEY) === RECOVERY_VERSION) return;
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
