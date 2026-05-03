"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

// ── Config ──────────────────────────────────────────────────
const SCROLL_THRESHOLDS = [10, 25, 50, 75, 90, 100];
const BATCH_FLUSH_INTERVAL = 3000; // Flush events every 3 seconds
const HOVER_DWELL_THRESHOLD = 800; // 800ms hover = meaningful engagement

type AnalyticsEvent = {
  eventType: string;
  path: string;
  scrollDepth?: number;
  sectionName?: string;
  elementId?: string;
  elementText?: string;
  dwellTimeMs?: number;
  payload?: Record<string, unknown>;
};

export function BehavioralTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);

  // ── Deduplication Sets ────────────────────────────────────
  const trackedScrolls = useRef<Set<number>>(new Set());
  const trackedSections = useRef<Set<string>>(new Set());
  const trackedFormFields = useRef<Set<string>>(new Set());

  // ── Dwell Time Tracking ───────────────────────────────────
  const sectionEntryTimes = useRef<Map<string, number>>(new Map());

  // ── Event Batching ────────────────────────────────────────
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Hover State ───────────────────────────────────────────
  const hoverTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── RAF Throttle State ────────────────────────────────────
  const scrollTicking = useRef(false);

  // ── Observers ─────────────────────────────────────────────
  const sectionObserverRef = useRef<IntersectionObserver | null>(null);

  // ── Queue an event (batched, not sent immediately) ────────
  const queueEvent = useCallback((event: AnalyticsEvent) => {
    eventQueue.current.push(event);
  }, []);

  // ── Flush the batch to the API ────────────────────────────
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
      // Silent fail — re-queue on failure for next flush
      eventQueue.current.unshift(...batch);
    }
  }, []);

  // ── Main Setup Effect ─────────────────────────────────────
  useEffect(() => {
    // 1. Session ID
    let sid = localStorage.getItem("hume_analytics_sid");
    if (!sid) {
      sid = self.crypto.randomUUID();
      localStorage.setItem("hume_analytics_sid", sid);
    }
    sessionIdRef.current = sid;

    // Reset per-page dedup sets on navigation
    trackedScrolls.current.clear();
    trackedSections.current.clear();
    trackedFormFields.current.clear();
    sectionEntryTimes.current.clear();

    // 2. Page View
    queueEvent({ eventType: "page_view", path: pathname });

    // 3. Scroll Tracking (throttled with rAF)
    const handleScroll = () => {
      if (scrollTicking.current) return;
      scrollTicking.current = true;

      requestAnimationFrame(() => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) { scrollTicking.current = false; return; }
        const scrollPercent = Math.round((window.scrollY / docHeight) * 100);

        for (const threshold of SCROLL_THRESHOLDS) {
          if (scrollPercent >= threshold && !trackedScrolls.current.has(threshold)) {
            trackedScrolls.current.add(threshold);
            queueEvent({ eventType: "scroll", path: pathname, scrollDepth: threshold });
          }
        }
        scrollTicking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // 4. Section Tracking with Dwell Time
    sectionObserverRef.current?.disconnect();
    const observer = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        for (const entry of entries) {
          const name = entry.target.getAttribute("data-analytics-section");
          if (!name) continue;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Section entered viewport — record entry time
            sectionEntryTimes.current.set(name, now);

            // Fire section_view only once per page load
            if (!trackedSections.current.has(name)) {
              trackedSections.current.add(name);
              queueEvent({ eventType: "section_view", path: pathname, sectionName: name });
            }
          } else if (sectionEntryTimes.current.has(name)) {
            // Section left viewport — calculate dwell time
            const entryTime = sectionEntryTimes.current.get(name)!;
            const dwellMs = now - entryTime;
            sectionEntryTimes.current.delete(name);

            if (dwellMs >= 500) { // Only record meaningful dwell (>500ms)
              queueEvent({
                eventType: "section_dwell",
                path: pathname,
                sectionName: name,
                dwellTimeMs: dwellMs,
              });
            }
          }
        }
      },
      { threshold: [0, 0.5] }
    );

    // Slight delay to let DOM render
    const sectionTimer = setTimeout(() => {
      document.querySelectorAll("[data-analytics-section]").forEach((el) => observer.observe(el));
    }, 500);
    sectionObserverRef.current = observer;

    // 5. Exit Intent Detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        queueEvent({ eventType: "exit_intent", path: pathname, payload: { cause: "mouse_leave_top" } });
        // Flush immediately on exit intent — user might be leaving
        flushEvents();
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // 6. Batch Flush Timer
    flushTimerRef.current = setInterval(flushEvents, BATCH_FLUSH_INTERVAL);

    // 7. Flush on page hide (user navigating away or closing tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Use sendBeacon for reliability when page is closing
        const batch = [...eventQueue.current];
        if (batch.length > 0) {
          eventQueue.current = [];
          navigator.sendBeacon(
            "/api/analytics/behavior",
            JSON.stringify({ sessionId: sessionIdRef.current, events: batch })
          );
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sectionObserverRef.current?.disconnect();
      clearTimeout(sectionTimer);
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      // Flush remaining events
      flushEvents();
    };
  }, [pathname, queueEvent, flushEvents]);

  // ── Click Tracking ────────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("button, a, [data-analytics-click]");
      if (clickable) {
        queueEvent({
          eventType: "click",
          path: pathname,
          elementId: clickable.id || undefined,
          elementText: clickable.textContent?.substring(0, 50) || undefined,
          sectionName:
            clickable.closest("[data-analytics-section]")?.getAttribute("data-analytics-section") || undefined,
        });
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname, queueEvent]);

  // ── Hover Tracking (meaningful engagement only) ───────────
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable = target.closest("[data-analytics-click], .product-card, button, a");
      if (!hoverable) return;

      const key = hoverable.id || hoverable.textContent?.substring(0, 30) || "unknown";
      if (hoverTimers.current.has(key)) return; // Already tracking

      const timer = setTimeout(() => {
        queueEvent({
          eventType: "hover",
          path: pathname,
          elementId: hoverable.id || undefined,
          elementText: hoverable.textContent?.substring(0, 50) || undefined,
          sectionName:
            hoverable.closest("[data-analytics-section]")?.getAttribute("data-analytics-section") || undefined,
          dwellTimeMs: HOVER_DWELL_THRESHOLD,
        });
        hoverTimers.current.delete(key);
      }, HOVER_DWELL_THRESHOLD);

      hoverTimers.current.set(key, timer);
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverable = target.closest("[data-analytics-click], .product-card, button, a");
      if (!hoverable) return;

      const key = hoverable.id || hoverable.textContent?.substring(0, 30) || "unknown";
      const timer = hoverTimers.current.get(key);
      if (timer) {
        clearTimeout(timer);
        hoverTimers.current.delete(key);
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      // Clear pending timers
      hoverTimers.current.forEach((timer) => clearTimeout(timer));
      hoverTimers.current.clear();
    };
  }, [pathname, queueEvent]);

  // ── Form Interaction Tracking ─────────────────────────────
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

  return null; // Invisible component
}
