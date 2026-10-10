"use client";
import SiteLoading from "@/components/SiteLoading";
import { useEffect, useState } from "react";
import { ACTIVITY_LABELS, readCheckoutActivity, type CheckoutActivity } from "@/lib/checkout-activity";
export default function CheckoutActivityTimeline({ sessionId }: { sessionId: string }) {
  return <ActivityForSession key={sessionId} sessionId={sessionId} />;
}
function ActivityForSession({ sessionId }: { sessionId: string }) {
  const [events, setEvents] = useState<CheckoutActivity[]>([]);
  const [state, setState] = useState("Loading activity…");
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    fetch(`/api/admin/checkout-activity?sessionId=${encodeURIComponent(sessionId)}`, { signal: controller.signal, cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (active) { setEvents(readCheckoutActivity(data.activity)); setState(""); }
    }).catch(() => { if (active) setState("Activity could not be loaded. Reopen this panel to retry."); }).finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [sessionId]);
  const last = events.findLast(item => !["page_hidden", "navigation_requested", "reason_given", "full_selected", "partial_cod_selected"].includes(item.event));
  const suggestions: Partial<Record<CheckoutActivity["event"], string>> = {
    opened: "No later payment action recorded; the exact reason is unknown.",
    validation_failed: "Details or availability prevented checkout from continuing.",
    payment_start_failed: "A technical issue prevented payment from starting.",
    payment_window_missing: "The payment window did not appear.",
    payment_window_closed: "The customer closed payment without a confirmed result.",
    payment_failed: "The payment provider reported a failure.",
    verification_failed: "Payment confirmation needs checking before another payment.",
    payment_callback_verified: "Payment was verified; check the order’s payment status.",
  };
  return <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><h3 className="text-sm font-semibold text-white">Checkout exit insight</h3>{state === "Loading activity…" ? <SiteLoading compact dark title="Gathering checkout activity" description="Preparing the last recorded checkout stage." /> : state ? <p className="mt-2 text-xs text-white/60">{state}</p> : last ? <><p className="mt-2 text-sm text-white/80">Last stage: {ACTIVITY_LABELS[last.event]}</p><p className="mt-1 text-xs text-white/60">Possible reason: {suggestions[last.event] || "No later payment result recorded; the exact reason is unknown."}</p><p className="mt-2 text-[11px] text-white/40">{new Date(events.at(-1)!.at).toLocaleString()} · Based on recorded activity</p></> : <p className="mt-2 text-xs text-white/50">No activity recorded yet.</p>}</section>;
}
