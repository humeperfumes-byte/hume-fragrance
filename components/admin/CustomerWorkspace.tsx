"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Loader2, Search, UserRound } from 'lucide-react';
import type { Product } from '@/db/schema';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ManualOrderCreator } from './ManualOrderCreator';
import { customerIdentity, eligibleCustomerPhone, latestCustomerContact, type CustomerSearchRow } from '@/lib/admin-customer-records';

type Result = { rows: CustomerSearchRow[]; hasMore: boolean };
const inputClass = 'rounded-xl border border-white/15 bg-black/20 px-3 py-2 text-sm text-white';
const money = (value: unknown) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function CustomerWorkspace({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<Result>({ rows: [], hasMore: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<CustomerSearchRow | null>(null);
  const [history, setHistory] = useState<Result>({ rows: [], hasMore: false });
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [creating, setCreating] = useState<{ source: CustomerSearchRow; repeat: boolean } | null>(null);
  const [creatingBusy, setCreatingBusy] = useState(false);
  const [historyRetry, setHistoryRetry] = useState(0);
  const [exportType, setExportType] = useState('customers');
  const [exportMatches, setExportMatches] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const downloadLock = useRef(false);
  const identity = selected ? customerIdentity(selected) : null;
  const latestContact = latestCustomerContact(history.rows.length ? history.rows : selected ? [selected] : []);

  useEffect(() => {
    const controller = new AbortController();
    if (query.trim().length < 2) { setResult({ rows: [], hasMore: false }); setLoading(false); setError(''); return; }
    setLoading(true); setError('');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/customers/search?q=${encodeURIComponent(query.trim())}&page=${page}`, { signal: controller.signal, cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Search failed.');
        if (!controller.signal.aborted) setResult(data);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Search failed.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, page]);

  useEffect(() => {
    if (!identity) return;
    const controller = new AbortController();
    setHistoryLoading(true); setHistoryError('');
    (async () => {
      try {
        const response = await fetch(`/api/admin/customers/search?identity=${encodeURIComponent(identity)}&page=${historyPage}`, { signal: controller.signal, cache: 'no-store' });
        const data: Result & { error?: string } = await response.json();
        if (!response.ok) throw new Error(data.error || 'History failed.');
        if (!controller.signal.aborted) setHistory(previous => ({ rows: historyPage ? [...previous.rows, ...data.rows.filter(row => !previous.rows.some(old => old.source === row.source && old.id === row.id))] : data.rows, hasMore: data.hasMore }));
      } catch (cause) { if (!controller.signal.aborted) setHistoryError(cause instanceof Error ? cause.message : 'History failed.'); }
      finally { if (!controller.signal.aborted) setHistoryLoading(false); }
    })();
    return () => controller.abort();
  }, [identity, historyPage, historyRetry]);

  const matches = useMemo(() => {
    const groups = new Map<string, { row: CustomerSearchRow; matched: CustomerSearchRow[] }>();
    for (const row of result.rows) {
      const key = customerIdentity(row) || `${row.source}:${row.id}`;
      const group = groups.get(key);
      if (group) group.matched.push(row); else groups.set(key, { row, matched: [row] });
    }
    return [...groups.values()];
  }, [result]);

  async function download() {
    if (downloadLock.current) return;
    downloadLock.current = true; setDownloading(true); setError('');
    try {
      const response = await fetch(`/api/admin/customers/export?type=${exportType}${exportMatches && query.trim() ? `&q=${encodeURIComponent(query.trim())}` : ''}`, { cache: 'no-store', signal: AbortSignal.timeout(60000) });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Download failed.'); }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a'); anchor.href = url;
      anchor.download = `HUME-${exportType}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Download failed.'); }
    finally { downloadLock.current = false; setDownloading(false); }
  }

  return <section className="space-y-4 rounded-2xl border border-purple-300/20 bg-gradient-to-br from-purple-300/[0.07] to-transparent p-4 sm:p-5">
    <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-purple-200" /><div><h2 className="font-semibold text-white">Find a customer · Repeat an order</h2><p className="mt-1 text-xs text-white/50">Search all history, beyond the date range below. Mobile, name, email, order or tracking number.</p></div></div>
    <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-white/40" /><input aria-label="Search all customers and orders" value={query} maxLength={120} onChange={event => { setQuery(event.target.value); setPage(0); }} placeholder="Mobile, name, email, order or tracking number…" className={`${inputClass} w-full pl-10 pr-10`} />{loading && <Loader2 aria-label="Searching" className="absolute right-3 top-3 h-4 w-4 animate-spin text-purple-200" />}</div>
    {query.trim().length >= 2 && <div aria-busy={loading} className="space-y-2">
      {loading ? <p role="status" className="text-sm text-purple-200">Searching customer and order history…</p> : !error && !matches.length ? <p className="text-sm text-white/50">No matches found.</p> : null}
      {!loading && !error && matches.map(({ row, matched }) => <button key={customerIdentity(row) || `${row.source}:${row.id}`} type="button" onClick={() => { setSelected(row); setHistory({ rows: [], hasMore: false }); setHistoryPage(0); setCreating(null); }} disabled={!customerIdentity(row)} className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-left hover:border-purple-300/40 disabled:opacity-50"><span><span className="block text-sm font-semibold text-white">{row.fullName || 'Name not provided'}</span><span className="text-xs text-white/55">{eligibleCustomerPhone(row.phone) || row.phone || row.email || 'No contact saved'}</span></span><span className="text-right text-xs text-white/55">{matched.slice(0, 3).map(item => item.orderNumber || 'Saved checkout').join(' · ')}<span className="mt-1 block text-purple-200">View full history →</span></span></button>)}
      <div className="flex items-center gap-4 text-sm"><button type="button" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)} className="disabled:opacity-30">Previous</button><span className="text-xs text-white/40">Results page {page + 1}</span><button type="button" disabled={loading || !result.hasMore} onClick={() => setPage(value => value + 1)} className="disabled:opacity-30">Next</button></div>
    </div>}
    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
      <select aria-label="Export data type" value={exportType} onChange={event => setExportType(event.target.value)} className={inputClass}><option value="customers">Customers with mobile numbers</option><option value="incomplete">Incomplete leads with mobile numbers</option><option value="orders">Orders</option></select>
      <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={exportMatches} onChange={event => setExportMatches(event.target.checked)} />Only search matches</label>
      <button type="button" onClick={download} disabled={downloading} className="inline-flex items-center gap-2 rounded-xl bg-purple-200 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">{downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}{downloading ? 'Preparing CSV…' : 'Download CSV'}</button>
      <p className="w-full text-xs text-white/40">All history by default. One customer per valid Indian mobile number; incomplete profiles included. Incomplete leads have no saved order. Order exports include unpaid and cancelled orders.</p>
    </div>
    {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
    <Sheet open={!!selected} onOpenChange={open => { if (!open && !creatingBusy && (!creating || window.confirm("Close customer history? Unsaved order changes will be lost."))) { setSelected(null); setCreating(null); } }}><SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-[#080808] text-white sm:max-w-3xl">
      <SheetHeader><SheetTitle className="text-white">{latestContact?.fullName || 'Customer history'}</SheetTitle><SheetDescription>{selected?.phone || selected?.email} · All saved orders and checkouts</SheetDescription></SheetHeader>
      {selected && <div className="mt-5 space-y-4">
        {!creating && <button className="rounded-xl bg-purple-200 px-4 py-2 text-sm font-semibold text-black" onClick={() => setCreating({ source: { ...(history.rows[0] || selected), ...latestContact }, repeat: false })}>New order for this customer</button>}
        {creating && <div className="space-y-3 rounded-2xl border border-purple-300/25 p-3"><button type="button" disabled={creatingBusy} onClick={() => { if (window.confirm('Close this order form? Any unsaved changes will be lost.')) setCreating(null); }} className="text-xs text-white/60 underline">Close order form</button><ManualOrderCreator key={`${creating.source.source}:${creating.source.id}:${creating.repeat}`} products={products} onBusyChange={setCreatingBusy} {...(creating.repeat ? { initialOrder: creating.source, repeatOf: creating.source.source === 'order' ? creating.source.id : undefined } : { customer: creating.source })} /></div>}
        {historyLoading && <p role="status" className="flex items-center gap-2 text-sm text-purple-200"><Loader2 className="h-4 w-4 animate-spin" />Loading history…</p>}
        {historyError && <div role="alert" className="text-sm text-amber-200">{historyError}<button className="ml-2 underline" onClick={() => { setHistoryRetry(value => value + 1); }}>Retry</button></div>}
        {history.rows.map(row => <article key={`${row.source}:${row.id}`} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold">{row.orderNumber || 'Saved checkout'}</h3><p className="mt-1 text-xs text-white/45">{new Date(row.createdAt).toLocaleString('en-IN')} · {row.status}</p></div><span className="text-sm">{money(row.grandTotal)}</span></div>
          <p className="text-xs leading-5 text-white/55">{[row.addressLine1, row.addressLine2, row.city, row.state, row.pincode].filter(Boolean).join(', ') || 'Delivery address not yet saved'}</p>
          <div className="space-y-2">{row.cartSnapshot?.map((item, index) => <div key={`${item.id}:${index}`} className="text-sm"><span>{item.name} × {item.quantity}</span>{!!item.sampleSelections?.length && <p className="mt-1 text-xs leading-5 text-white/45">{item.sampleSelections.map(sample => sample.name).sort((a, b) => a.localeCompare(b)).join(', ')}</p>}</div>)}</div>
          {!creating && <button type="button" disabled={!row.cartSnapshot?.length} onClick={() => { setCreating({ source: row, repeat: true }); }} className="rounded-lg border border-purple-300/30 px-3 py-2 text-xs font-semibold text-purple-100 disabled:opacity-40">{row.source === 'order' ? 'Repeat order' : 'Create order from saved cart'}</button>}
        </article>)}
        {history.hasMore && <button disabled={historyLoading} onClick={() => setHistoryPage(value => value + 1)} className="rounded-lg border border-white/15 px-3 py-2 text-sm disabled:opacity-40">Load older history</button>}
      </div>}
    </SheetContent></Sheet>
  </section>;
}
