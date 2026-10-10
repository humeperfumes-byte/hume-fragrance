"use client";
import { useCallback, useEffect, useState } from "react";
type Event = { reference: string; code: string; occurredAt: string };
export default function DiagnosticsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [message, setMessage] = useState("Loading diagnostics…");
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/diagnostics", { cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error("Could not load diagnostics");
      const result = await response.json(); setEvents(result.events);
      setMessage(!result.enabled ? "Monitoring is disabled." : result.alertsConfigured ? "Monitoring and external alerts are configured." : "Monitoring is enabled. External alerts have not been configured.");
    } catch { setMessage("Could not load diagnostics. Retry shortly."); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <main className="mx-auto max-w-5xl space-y-6 p-6"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Checkout diagnostics</h1><button onClick={() => void refresh()} className="rounded-xl border px-4 py-2">Refresh</button></div><p>{message}</p><p className="text-sm opacity-70">Fixed error codes and references only. Customer details, payment payloads and private URLs are excluded. Retention: 30 days.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Time</th><th className="p-3">Event</th><th className="p-3">Reference</th></tr></thead><tbody>{events.map(event => <tr key={event.reference} className="border-t"><td className="p-3">{new Date(event.occurredAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td><td className="p-3">{event.code}</td><td className="p-3 font-mono">{event.reference}</td></tr>)}</tbody></table>{events.length === 0 && <p className="p-4">No recent events.</p>}</div></main>;
}
