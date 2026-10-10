"use client";
import { useState } from "react";
export function CustomerLinkButton({ scope, resourceId }: { scope: "order" | "checkout"; resourceId: string }) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<{ id: string; url: string } | null>(null);
  const [message, setMessage] = useState("");
  async function createOrCopy() {
    setBusy(true); setMessage("");
    try {
      let current = link;
      if (!current) {
        const response = await fetch("/api/admin/customer-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope, resourceId }), signal: AbortSignal.timeout(15000) });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to create link");
        current = { id: data.id, url: new URL(data.path, window.location.origin).href }; setLink(current);
      }
      await navigator.clipboard.writeText(current.url); setMessage("Link copied. Share it only with this customer.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to copy link"); }
    finally { setBusy(false); }
  }
  async function revoke() {
    if (!link) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/customer-links", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: link.id }) });
      if (!response.ok) throw new Error("Unable to revoke link");
      setLink(null); setMessage("Link revoked.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to revoke link"); }
    finally { setBusy(false); }
  }
  return <div className="space-y-2"><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={createOrCopy} className="rounded-lg border border-purple-300/30 bg-purple-300/10 px-3 py-2 text-sm text-purple-100">{busy ? "Working…" : scope === "order" ? "Copy customer order link" : "Copy resume checkout link"}</button>{link && <button type="button" disabled={busy} onClick={revoke} className="rounded-lg border border-white/20 px-3 py-2 text-sm">Revoke link</button>}</div>{message && <p role="status" className="text-xs text-white/65">{message}</p>}{link && <input readOnly aria-label="Customer link" value={link.url} className="w-full rounded-lg border border-white/15 bg-black/20 p-2 text-xs" />}</div>;
}
