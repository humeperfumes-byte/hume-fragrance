"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SCROLL_THRESHOLDS = [10, 25, 50, 75, 90, 100];

export function BehavioralTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const trackedThresholds = useRef<Set<number>>(new Set());
  const sectionObservers = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 1. Initialize or Get Session ID
    let sid = localStorage.getItem("hume_analytics_sid");
    if (!sid) {
      sid = self.crypto.randomUUID();
      localStorage.setItem("hume_analytics_sid", sid);
    }
    sessionIdRef.current = sid;

    // 2. Track Page View
    trackEvent("page_view", { path: pathname });

    // 3. Setup Scroll Tracking
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      SCROLL_THRESHOLDS.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedThresholds.current.has(threshold)) {
          trackedThresholds.current.add(threshold);
          trackEvent("scroll", { scrollDepth: threshold });
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    // 4. Setup Section Tracking (Hero, Products, Reviews, etc.)
    setupSectionTracking();

    // 5. Exit Intent Detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        trackEvent("exit_intent", { cause: "mouse_leave_top" });
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      sectionObservers.current?.disconnect();
      trackedThresholds.current.clear();
    };
  }, [pathname]);

  const setupSectionTracking = () => {
    sectionObservers.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const sectionName = entry.target.getAttribute("data-analytics-section");
            if (sectionName) {
              trackEvent("section_view", { sectionName });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll("[data-analytics-section]").forEach((el) => {
      observer.observe(el);
    });

    sectionObservers.current = observer;
  };

  const trackEvent = async (eventType: string, payload: any) => {
    try {
      await fetch("/api/analytics/behavior", {
        method: "POST",
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          eventType,
          path: pathname,
          ...payload,
        }),
      });
    } catch (e) {
      // Silent fail to not interrupt user experience
    }
  };

  // Capture Clicks on important elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("button, a, [data-analytics-click]");
      if (clickable) {
        trackEvent("click", {
          elementId: clickable.id,
          elementText: clickable.innerText?.substring(0, 50),
          sectionName: clickable.closest("[data-analytics-section]")?.getAttribute("data-analytics-section"),
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null; // Invisible component
}
