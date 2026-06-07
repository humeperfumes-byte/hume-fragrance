"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { NAVIGATION_LOADING_EVENT } from "@/lib/navigation-loading";

const SCROLL_POSITION_PREFIX = "hume_scroll_position:";

function getLocationKey(url = window.location.href) {
  const parsed = new URL(url, window.location.href);
  return `${parsed.pathname}${parsed.search}`;
}

function getStorageKey(locationKey: string) {
  return `${SCROLL_POSITION_PREFIX}${locationKey}`;
}

function saveScrollPosition(locationKey = getLocationKey()) {
  try {
    window.sessionStorage.setItem(getStorageKey(locationKey), String(window.scrollY));
  } catch {
    // Session storage may be unavailable in hardened browsers.
  }
}

function readScrollPosition(locationKey: string) {
  try {
    const value = window.sessionStorage.getItem(getStorageKey(locationKey));
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function getInternalNavigationHref(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const anchor = target.closest("a[href]");
  if (!anchor || !(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;

  const current = new URL(window.location.href);
  if (`${url.pathname}${url.search}` === `${current.pathname}${current.search}`) {
    return null;
  }

  return url.href;
}

export default function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const navigationTypeRef = useRef<"push" | "pop">("push");
  const previousLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        saveScrollPosition();
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || isModifiedClick(event)) return;
      if (!getInternalNavigationHref(event.target)) return;

      saveScrollPosition();
      navigationTypeRef.current = "push";
    };

    const handlePopState = () => {
      navigationTypeRef.current = "pop";
    };

    const handleProgrammaticNavigation = () => {
      saveScrollPosition();
      navigationTypeRef.current = "push";
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(NAVIGATION_LOADING_EVENT, handleProgrammaticNavigation);

    return () => {
      window.cancelAnimationFrame(frame);
      saveScrollPosition();
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(NAVIGATION_LOADING_EVENT, handleProgrammaticNavigation);
    };
  }, []);

  useEffect(() => {
    const locationKey = search ? `${pathname}?${search}` : pathname;
    if (previousLocationKeyRef.current === locationKey) return;

    const navigationType = navigationTypeRef.current;
    previousLocationKeyRef.current = locationKey;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (navigationType === "pop") {
          window.scrollTo({ top: readScrollPosition(locationKey), left: 0, behavior: "auto" });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }

        navigationTypeRef.current = "push";
      });
    });
  }, [pathname, search]);

  return null;
}
