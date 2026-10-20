"use client";
import { useState } from 'react';
import type { Order, Product } from '@/db/schema';
import { ManualOrderCreator } from './ManualOrderCreator';

export function RepeatOrderAction({ order, products }: { order: Order; products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  return <div className="space-y-3">
    <button type="button" disabled={busy} onClick={() => { if (!open || window.confirm('Close this repeat order form? Unsaved changes will be lost.')) setOpen(!open); }} className="rounded-lg border border-purple-300/30 bg-purple-300/10 px-3 py-2 text-xs font-semibold text-purple-100 disabled:opacity-40">{open ? 'Close repeat order' : 'Repeat order'}</button>
    {open && <ManualOrderCreator products={products} initialOrder={order} repeatOf={order.id} onBusyChange={setBusy} />}
  </div>;
}
