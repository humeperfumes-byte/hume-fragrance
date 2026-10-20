"use client";
import { useRef, useState } from 'react';
import type { Order } from '@/db/schema';
import { isExternallySettled, orderPaymentBalance } from '@/lib/external-order-payment';

export function ExternalPaymentPanel({ order, onUpdate }: { order: Order; onUpdate: (order: Order) => void }) {
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const balance = orderPaymentBalance(order);
  const settled = isExternallySettled(order);
  if (/refund|disput|cancel/i.test(order.status)) return null;
  if (!settled && (balance.remainingMinor <= 0 || balance.receipt)) return null;
  async function markFullyPaid() {
    if (inFlight.current || settled) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/orders/' + encodeURIComponent(order.id) + '/record-payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMinor: balance.remainingMinor, method: 'admin_confirmed', reference: 'Full payment confirmed by admin', confirmed: true, expectedUpdatedAt: new Date(order.updatedAt).toISOString() }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not record payment');
      onUpdate(data.order);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not record payment');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return <div className="space-y-2">
    <button type="button" onClick={markFullyPaid} disabled={busy || settled} aria-busy={busy} className="rounded-lg border border-emerald-300/25 bg-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-50 disabled:opacity-50">
      {busy ? 'Marking fully paid…' : settled ? 'Fully paid' : 'Mark fully paid'}
    </button>
    {balance.overpaidMinor > 0 && <p role="alert" className="text-sm text-amber-200">Payments exceed the total by ₹{(balance.overpaidMinor / 100).toFixed(2)}. Review the receipts and arrange any refund separately.</p>}
    {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}
  </div>;
}
