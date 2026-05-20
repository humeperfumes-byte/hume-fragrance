"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { NAVIGATION_LOADING_EVENT } from "@/lib/navigation-loading";

type ToastHandle = ReturnType<typeof toast>;

const LOADING_TOAST_TIMEOUT_MS = 25000;
const DEFAULT_LOADING_TITLE = "Opening page";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function getInternalHref(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const anchor = target.closest("a[href]");
  if (!anchor || !(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;

  const current = new URL(window.location.href);
  const sameDocument =
    url.pathname === current.pathname && url.search === current.search;

  if (sameDocument) return null;

  return url.href;
}

export default function NavigationLoadingToast() {
  const pathname = usePathname();
  const activeToastRef = useRef<ToastHandle | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  const dismissLoadingToast = useCallback(() => {
    activeToastRef.current?.dismiss();
    activeToastRef.current = null;

    if (fallbackTimerRef.current) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const showLoadingToast = useCallback((title = DEFAULT_LOADING_TITLE) => {
    if (activeToastRef.current) return;

    activeToastRef.current = toast({
      title,
      duration: 60000,
    });

    fallbackTimerRef.current = window.setTimeout(() => {
      dismissLoadingToast();
    }, LOADING_TOAST_TIMEOUT_MS);
  }, [dismissLoadingToast]);

  useEffect(() => {
    dismissLoadingToast();
  }, [dismissLoadingToast, pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0 || isModifiedClick(event)) return;
      if (!getInternalHref(event.target)) return;

      window.setTimeout(() => {
        showLoadingToast();
      }, 40);
    };

    const handlePopState = () => {
      showLoadingToast();
    };

    const handleProgrammaticNavigation = (event: Event) => {
      const detail =
        event instanceof CustomEvent &&
        typeof event.detail === "object" &&
        event.detail !== null
          ? (event.detail as { title?: unknown })
          : null;
      const title =
        typeof detail?.title === "string" && detail.title.trim()
          ? detail.title.trim()
          : DEFAULT_LOADING_TITLE;

      showLoadingToast(title);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener(
      NAVIGATION_LOADING_EVENT,
      handleProgrammaticNavigation,
    );

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(
        NAVIGATION_LOADING_EVENT,
        handleProgrammaticNavigation,
      );
      dismissLoadingToast();
    };
  }, [dismissLoadingToast, showLoadingToast]);

  return null;
}
