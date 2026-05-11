"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DISABLED_PATH_PREFIXES = [
  "/admin",
  "/checkout",
  "/cart-preview",
  "/preview",
  "/email-preview",
  "/refill-subscription",
];

function shouldUsePremiumScroll(pathname: string) {
  if (DISABLED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;

  return window.innerWidth >= 1024;
}

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldUsePremiumScroll(pathname)) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.88,
    });

    document.documentElement.classList.add("premium-scroll-active");

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    };

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);
      document.documentElement.classList.remove("premium-scroll-active");
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
