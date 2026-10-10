"use client";
import { useEffect, useState } from "react";
import type { SavedInvoice } from "@/lib/invoice-document";
export function SavedInvoiceLibrary({ onOpen, onDuplicate, onClose }: { onOpen: (invoice: SavedInvoice) => void; onDuplicate: (invoice: SavedInvoice) => void; onClose: () => void }) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]), [query, setQuery] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function loadInvoices() {
      try {
        const response = await fetch("/api/admin/invoices", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load invoices");
        if (active) setInvoices(data.invoices);
      } catch (error) {
        if (active) setError(error instanceof Error ? error.message : "Unable to load invoices");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadInvoices();
    // Ignore stale results when closed or when React replays the effect in development.
    return () => { active = false; };
  }, []);
  const filtered = invoices.filter(invoice => `${invoice.title} ${invoice.document.invoiceNumber} ${invoice.document.buyerName} ${invoice.document.items.map(item => item.name).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="border-b border-white/10 bg-[#17181e] p-5 print:hidden"><div className="mx-auto max-w-6xl space-y-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Saved invoices</h2><p className="text-sm text-white/50">Open to update an invoice, or use its details for a new one.</p></div><button onClick={onClose} className="invoice-small-button">Close</button></div><input className="w-full rounded-xl border border-white/20 bg-black/20 px-4 py-3 text-sm" placeholder="Search customer, invoice number or item…" aria-label="Search saved invoices" value={query} onChange={e => setQuery(e.target.value)} />{loading && <p className="text-sm">Loading saved invoices…</p>}{error && <p role="alert" className="text-sm text-red-300">{error}</p>}{!loading && !error && !filtered.length && <p className="text-sm text-white/50">{invoices.length ? "No matching invoices." : "No saved invoices yet. Fill in an invoice and choose Save invoice."}</p>}<div className="grid max-h-[420px] gap-3 overflow-auto sm:grid-cols-2 lg:grid-cols-3">{filtered.map(invoice => <article key={invoice.id} className="rounded-xl border border-white/10 bg-white/5 p-4"><h3 className="truncate font-semibold" title={invoice.title}>{invoice.title}</h3><p className="mt-1 text-sm text-white/60">{invoice.document.invoiceNumber} · {invoice.document.buyerName}</p><p className="mt-1 text-xs text-white/40">{invoice.document.items.length} item(s) · Saved {new Date(invoice.updatedAt).toLocaleString("en-IN")}</p><div className="mt-4 flex gap-2"><button className="invoice-small-button" onClick={() => onOpen(invoice)}>Open & edit</button><button className="invoice-small-button" onClick={() => onDuplicate(invoice)}>Use as new</button></div></article>)}</div></div></div>;
}
