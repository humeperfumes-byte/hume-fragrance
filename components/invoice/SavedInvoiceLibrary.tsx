"use client";
import SiteLoading from "@/components/SiteLoading";
import { Search, FileText, Copy, X } from "lucide-react";
import { calculateInvoice } from "@/lib/invoice-calculations";
import { formatINR } from "@/lib/currency";
import { useEffect, useState } from "react";
import type { SavedInvoice } from "@/lib/invoice-document";
export function SavedInvoiceLibrary({ onOpen, onDuplicate, onClose }: { onOpen: (invoice: SavedInvoice) => void; onDuplicate: (invoice: SavedInvoice) => void; onClose: () => void }) {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]), [query, setQuery] = useState(""), [error, setError] = useState(""), [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function loadInvoices() {
      try {
        const response = await fetch("/api/admin/invoices", { cache: "no-store", signal: AbortSignal.timeout(30000) });
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
  const [status, setStatus] = useState("All");
  const [documentState,setDocumentState]=useState("all");
  const [sort, setSort] = useState("updated");
  const total = (invoice: SavedInvoice) => calculateInvoice(invoice.document).grandTotal;
  const filtered = invoices.filter(invoice => (documentState==="all"||(invoice.document.lifecycle||"draft")===documentState) && (status === "All" || invoice.document.paymentStatus === status) && `${invoice.title} ${invoice.document.invoiceNumber} ${invoice.document.buyerName} ${invoice.document.invoiceDate} ${invoice.title} ${invoice.document.items.map(item => item.name).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "amount" ? total(b) - total(a) : sort === "date" ? b.document.invoiceDate.localeCompare(a.document.invoiceDate) : Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return <section className="border-b border-white/10 bg-[#12141b] p-5 print:hidden sm:p-7" aria-label="Saved invoice register"><div className="mx-auto max-w-6xl space-y-5">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c4aeec]">Invoice register</p><h2 className="mt-1 text-2xl font-semibold">Saved invoices</h2><p className="mt-2 text-sm text-white/45">Find a customer, update a document or reuse it for your next invoice.</p></div><button type="button" onClick={onClose} className="invoice-small-button"><X size={14} />Close</button></div>
    <div className="grid gap-3 sm:grid-cols-3">{[{ label: "Saved documents", value: String(invoices.length) }, { label: "Paid invoice value", value: formatINR(invoices.filter(invoice => invoice.document.paymentStatus === "Paid").reduce((sum, invoice) => sum + total(invoice), 0)) }, { label: "Needs payment follow-up", value: String(invoices.filter(invoice => invoice.document.paymentStatus !== "Paid").length) }].map(stat => <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-xs text-white/45">{stat.label}</p><p className="mt-2 text-2xl font-semibold tracking-tight">{loading ? "—" : stat.value}</p></div>)}</div>
    <div className="flex flex-col gap-3 sm:flex-row"><label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-white/35" aria-hidden="true" /><input className="w-full rounded-xl border border-white/15 bg-white/[0.03] py-3 pl-10 pr-4 text-sm" placeholder="Search customer, invoice number or item" aria-label="Search saved invoices" value={query} onChange={e => setQuery(e.target.value)} /></label><select aria-label="Filter document state" className="rounded-xl border border-white/15 bg-[#1c1e27] px-4 py-3 text-sm" value={documentState} onChange={e=>setDocumentState(e.target.value)}><option value="all">All documents</option><option value="draft">Drafts</option><option value="issued">Issued invoices</option></select><select aria-label="Filter payment status" className="rounded-xl border border-white/15 bg-[#1c1e27] px-4 py-3 text-sm" value={status} onChange={e => setStatus(e.target.value)}>{["All", "Unpaid", "Partially Paid", "Paid"].map(value => <option key={value}>{value}</option>)}</select><select aria-label="Sort invoices" className="rounded-xl border border-white/15 bg-[#1c1e27] px-4 py-3 text-sm" value={sort} onChange={e => setSort(e.target.value)}><option value="updated">Recently updated</option><option value="date">Invoice date</option><option value="amount">Highest total</option></select></div>
    {loading && <SiteLoading compact dark title="Opening saved invoices" description="Gathering your saved documents." />}
    {error && <p role="alert" className="rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-300">{error}</p>}
    {!loading && !error && <><p className="text-xs text-white/40">{filtered.length} of {invoices.length} saved invoices · Payment statuses are entered manually.</p><div className="max-h-[520px] overflow-auto rounded-2xl border border-white/10"><table className="w-full min-w-[760px] text-left text-sm"><thead className="sticky top-0 bg-[#20222b] text-[10px] uppercase tracking-wider text-white/45"><tr>{["Invoice / customer", "Date", "Payment", "Total", "Actions"].map(label => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead><tbody>{filtered.map(invoice => <tr key={invoice.id} className="border-t border-white/[0.07] transition hover:bg-white/[0.025]"><td className="px-5 py-4"><p className="font-medium">{invoice.document.invoiceNumber}</p><p className="mt-1 text-[10px] uppercase text-white/40">{invoice.document.lifecycle==="issued"?"Issued · details locked":"Draft"}</p><p className="mt-1 text-white/60">{invoice.document.buyerName}</p><p className="mt-1 max-w-xs truncate text-xs text-white/30" title={invoice.title}>{invoice.title}</p></td><td className="whitespace-nowrap px-5 py-4 text-white/60">{new Date(invoice.document.invoiceDate + "T00:00:00+05:30").toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td><td className="px-5 py-4"><span className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${invoice.document.paymentStatus === "Paid" ? "bg-emerald-300/10 text-emerald-200" : invoice.document.paymentStatus === "Partially Paid" ? "bg-[#c4aeec]/10 text-[#c4aeec]" : "bg-amber-300/10 text-amber-200"}`}>{invoice.document.paymentStatus}</span></td><td className="whitespace-nowrap px-5 py-4 font-semibold">{formatINR(total(invoice))}</td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" className="invoice-small-button" onClick={() => onOpen(invoice)}><FileText size={13} />Open</button><button type="button" className="invoice-small-button" onClick={() => onDuplicate(invoice)}><Copy size={13} />Use as new</button></div></td></tr>)}</tbody></table>{!filtered.length && <div className="p-10 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-white/25" /><p className="text-sm text-white/50">{invoices.length ? "No invoices match these filters." : "Save your first invoice to start your register."}</p></div>}</div><p className="text-[11px] text-white/35">Shows the latest 500 saved documents. Partially paid documents are counted for follow-up; no outstanding balance is inferred.</p></>}
  </div></section>;
}
