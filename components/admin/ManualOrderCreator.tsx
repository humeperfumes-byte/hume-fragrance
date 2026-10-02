"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product, Order } from "@/db/schema";
import { MANUAL_LINK_CHANNEL, readManualPayment } from "@/lib/manual-order";

const money = (minor: number) => `₹${(minor / 100).toFixed(2)}`;
export function ManualPaymentPanel({ order, onUpdate }: { order: Order; onUpdate?: (order: Order) => void }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  if (order.checkoutChannel !== MANUAL_LINK_CHANNEL) return null;
  const payment = readManualPayment(order.whatsappMessage);
  if (!payment) return null;
  async function act(action: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}/${action}`, { method: "POST" });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Request failed");
      onUpdate?.(data.order); router.refresh(); toast.success(action === "payment-link" ? "Payment link recovered" : `Payment checked: ${data.syncStatus}`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Request failed"); }
    finally { setBusy(false); }
  }
  async function copy(text: string) { try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { toast.error("Could not copy. Select and copy the link below."); } }
  const received = Math.round(Number(order.capturedPaymentAmount || 0) * 100) >= payment.advanceMinor;
  return <div className="space-y-3 rounded-xl border border-purple-400/30 bg-purple-400/5 p-4">
    <h3 className="font-semibold">Manual order payment</h3>
    <p className="text-sm">Total {money(payment.totalMinor)} · Pay online {money(payment.advanceMinor)} · COD balance {money(payment.codMinor)}</p>
    <p className="text-sm">{/refund|dispute/.test(order.status) ? `Payment requires review: ${order.status}` : received ? "Online payment received" : "Awaiting online payment"} · {order.paymentSyncStatus}</p>
    {payment.codMinor > 0 && <p className="text-xs text-muted-foreground">Set the courier COD collection amount to {money(payment.codMinor)} when booking the shipment. Delivery status does not confirm COD settlement.</p>}
    {payment.url && <a className="block break-all text-sm underline" href={payment.url} target="_blank" rel="noreferrer">{payment.url}</a>}
    <div className="flex flex-wrap gap-2">
      {payment.url && order.status !== "cancelled" && <><button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => copy(payment.url!)}>Copy payment link</button><button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => copy(`Hi ${order.fullName}, your HUME order ${order.orderNumber} totals ${money(payment.totalMinor)}. Please pay ${money(payment.advanceMinor)} here: ${payment.url}${payment.codMinor ? `\nRemaining ${money(payment.codMinor)} is payable on delivery.` : ""}`)}>Copy customer message</button></>}
      <button type="button" disabled={busy || order.status === "cancelled"} className="rounded border px-3 py-2 text-sm disabled:opacity-40" onClick={() => act(payment.linkId ? "reconcile-payment" : "payment-link")}>{busy ? "Checking…" : payment.linkId ? "Check Razorpay payment" : "Generate / recover link"}</button>
    </div>
  </div>;
}

export function ManualOrderCreator({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [result, setResult] = useState<Order | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [items, setItems] = useState([{ id: "", quantity: 1 }]);
  const [mode, setMode] = useState("full"), [shipping, setShipping] = useState(0), [discount, setDiscount] = useState(0);
  const router = useRouter();
  const available = products.filter(p => p.visibility === "public" && !p.badges.soldOut && !p.badges.comingSoon && p.priceCurrency === "INR" && !/discovery|kit|sample set/i.test(`${p.id} ${p.name}`));
  const total = Math.round((items.reduce((sum, item) => sum + Number(available.find(p => p.id === item.id)?.price || 0) * item.quantity, 0) + shipping - discount) * 100);
  const advance = mode === "partial_cod" ? Math.round(total * .2) : total;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true);
    const id = requestId || crypto.randomUUID(); setRequestId(id);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/orders/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, phone: String(form.phone).replace(/[\s()-]/g, ""), requestId: id, items, shippingFee: shipping, discount, paymentMode: mode }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not create order");
      setResult(data.order); router.refresh(); if (data.linkError) toast.error(data.linkError); else toast.success("Order and payment link created");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create order"); }
    finally { setBusy(false); }
  }
  const inputClass = "w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm";
  return <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
    <button type="button" onClick={() => setOpen(!open)} className="font-semibold">{open ? "−" : "+"} Create customer order</button>
    {open && (result ? <div className="mt-4 space-y-4"><p>Order created: <strong>{result.orderNumber}</strong> · {result.fullName}</p><ManualPaymentPanel order={result} onUpdate={setResult} /><button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => { setResult(null); setRequestId(null); setItems([{ id: "", quantity: 1 }]); setShipping(0); setDiscount(0); }}>Create another order</button></div> :
      <form onSubmit={submit} className="mt-4 space-y-4"><fieldset disabled={busy} className="space-y-4 disabled:opacity-60">
        <div className="grid gap-3 sm:grid-cols-2">{[{ name: "fullName", label: "Customer name", required: true }, { name: "phone", label: "Mobile number", required: true }, { name: "email", label: "Email (optional)", type: "email" }, { name: "addressLine1", label: "Street address", required: true }, { name: "addressLine2", label: "Apartment / landmark (optional)" }, { name: "city", label: "City", required: true }, { name: "state", label: "State", required: true }, { name: "pincode", label: "Pincode", required: true }].map(field => <label key={field.name} className="space-y-1 text-sm"><span>{field.label}</span><input className={inputClass} name={field.name} type={field.type || "text"} required={field.required} /></label>)}</div>
        {items.map((item, index) => <div key={index} className="flex gap-2"><select aria-label={`Perfume ${index + 1}`} required value={item.id} className={inputClass} onChange={e => setItems(items.map((row, i) => i === index ? { ...row, id: e.target.value } : row))}><option value="">Choose perfume</option>{available.map(p => <option key={p.id} value={p.id}>{p.name} · {p.size} · ₹{p.price}</option>)}</select><input aria-label="Quantity" type="number" min="1" max="20" required value={item.quantity} className="w-20 rounded border bg-black/20 px-2" onChange={e => setItems(items.map((row, i) => i === index ? { ...row, quantity: Number(e.target.value) } : row))} />{items.length > 1 && <button type="button" aria-label="Remove perfume" onClick={() => setItems(items.filter((_, i) => i !== index))}>×</button>}</div>)}
        <button type="button" className="text-sm underline" disabled={items.length >= 20} onClick={() => setItems([...items, { id: "", quantity: 1 }])}>Add perfume</button>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Shipping fee (₹)<input className={inputClass} type="number" min="0" max="10000" step="0.01" value={shipping} onChange={e => setShipping(Number(e.target.value))} /></label><label className="text-sm">Discount (₹)<input className={inputClass} type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></label></div>
        <label className="block text-sm">Discount reason<input name="adjustmentReason" required={discount > 0} className={inputClass} /></label>
        <label className="block text-sm">Order notes<textarea name="notes" className={inputClass} /></label>
        <label className="block text-sm">Payment option<select value={mode} onChange={e => setMode(e.target.value)} className={inputClass}><option value="full">100% online payment</option><option value="partial_cod">20% online advance + 80% COD</option></select></label>
        <p className="text-sm">Total {money(total)} · Online {money(advance)} · COD {money(total - advance)}</p>
        <p className="text-xs text-muted-foreground">Creates a pending order and a payment link. Copy and share the link yourself; no message is sent automatically.</p>
        <button disabled={busy || total < 100} type="submit" className="rounded-lg bg-purple-500 px-4 py-2 font-medium text-white disabled:opacity-40">{busy ? "Creating…" : "Create order & payment link"}</button>
      </fieldset></form>)}
  </section>;
}
