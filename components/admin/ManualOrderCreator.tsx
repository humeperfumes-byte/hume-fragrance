"use client";
import { useEffect, useRef, useState } from "react";
import { normalizeIndianMobile } from "@/lib/phone";
import Image from "next/image";
import { OrderProductPicker } from "./OrderProductPicker";
import { DISCOVERY_SET_IMAGES, DISCOVERY_SET_PRICE, isDiscoverySetProductId } from "@/lib/discovery-set";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product, Order } from "@/db/schema";
import { MANUAL_LINK_CHANNEL, readManualPayment } from "@/lib/manual-order";
import {isExternallySettled,readExternalReceipt} from '@/lib/external-order-payment';
import { buildRepeatOrder, type CustomerContact, type RepeatOrderSource } from '@/lib/admin-customer-records';

const money = (minor: number) => `₹${(minor / 100).toFixed(2)}`;
export function ManualPaymentPanel({ order, onUpdate, generating = false }: { order: Order; onUpdate?: (order: Order) => void; generating?: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  if (order.checkoutChannel !== MANUAL_LINK_CHANNEL) return null;
  const payment = readManualPayment(order.whatsappMessage);
  if (!payment) return null;
  if(isExternallySettled(order)){const receipt=readExternalReceipt(order.externalPaymentReceipt);return <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-4"><h3 className="font-semibold">Confirmed · Fully paid</h3><p className="mt-2 text-sm">Total {money(payment.totalMinor)} · COD ₹0.00</p><p className="mt-1 text-xs text-muted-foreground">Payment received outside the website · {receipt?.reference}</p></div>;}
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
      <button type="button" disabled={busy || generating || order.status === "cancelled"} className="rounded border px-3 py-2 text-sm disabled:opacity-40" onClick={() => act(payment.linkId ? "reconcile-payment" : "payment-link")}>{generating ? "Generating link…" : busy ? "Checking…" : payment.linkId ? "Check Razorpay payment" : "Generate / recover link"}</button>
    </div>
  </div>;
}

export function ManualOrderCreator({ products, initialOrder, customer, repeatOf, onBusyChange }: { products: Product[]; initialOrder?: RepeatOrderSource; customer?: CustomerContact; repeatOf?: string; onBusyChange?: (busy: boolean) => void }) {
  const [open, setOpen] = useState(!!initialOrder || !!customer), [busy, setBusy] = useState(false), [result, setResult] = useState<Order | null>(null);
  const pendingRequest = useRef<Record<string, unknown> | null>(null);
  const submitting = useRef(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("");
  const [repeat] = useState(() => initialOrder ? buildRepeatOrder(initialOrder, products) : null);
  const [items, setItems] = useState<{ id: string; quantity: number; sampleSelections?: string[] }[]>(repeat?.items || []);
  const [mode, setMode] = useState("full"), [shipping, setShipping] = useState(0), [discount, setDiscount] = useState(0);
  const router = useRouter();
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  const available = products.filter(p => p.priceCurrency === "INR");
  const total = Math.round((items.reduce((sum, item) => sum + (isDiscoverySetProductId(item.id) ? DISCOVERY_SET_PRICE : Number(available.find(p => p.id === item.id)?.price || 0)) * item.quantity, 0) + shipping - discount) * 100);
  const advance = mode === "partial_cod" ? Math.round(total * .2) : total;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const payload = pendingRequest.current || { ...form, phone: normalizeIndianMobile(String(form.phone || "")), requestId: crypto.randomUUID(), items, shippingFee: shipping, discount, paymentMode: mode, ...(repeatOf ? { repeatOf } : {}) };
    pendingRequest.current = payload;
    submitting.current = true; setBusy(true); setError(""); setStage("Saving order…");
    try {
      const response = await fetch("/api/admin/orders/manual?saveOnly=1", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(30000) });
      const data = await response.json();
      if (!response.ok) { if (response.status === 400) pendingRequest.current = null; throw new Error(data.error || "Could not create order"); }
      setResult(data.order);
      if(isExternallySettled(data.order)){toast.success('Confirmed, fully paid order created');router.refresh();return;}
      setStage("Order saved. Generating payment link…");
      try {
        const linkResponse = await fetch(`/api/admin/orders/${encodeURIComponent(data.order.id)}/payment-link`, { method: "POST", signal: AbortSignal.timeout(30000) });
        const linkData = await linkResponse.json();
        if (!linkResponse.ok) throw new Error(linkData.error || "Payment link could not be generated");
        setResult(linkData.order); toast.success("Order and payment link created");
      } catch (linkError) {
        setError(`Order saved. ${linkError instanceof Error && linkError.name !== "TimeoutError" ? linkError.message : "Payment link is taking longer than expected."} Use Generate / recover link below to continue with this order.`);
      }
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error && cause.name !== "TimeoutError" ? cause.message : "The request timed out. Retry to recover the same order; your details are preserved.";
      setError(message); toast.error(message);
    } finally { setBusy(false); submitting.current = false; setStage(""); }
  }
  const inputClass = "w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm";
  const contact = initialOrder || customer;
  return <section className={open ? "rounded-2xl border border-white/15 bg-white/5 p-5" : ""}>
    <button type="button" disabled={busy} aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-lg border border-purple-300/25 bg-purple-300/10 px-3 py-2 text-sm font-semibold text-purple-100">{open ? "−" : "+"} Create customer order</button>
    {open && error && <p role="alert" className="mt-4 rounded-xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>}{open && stage && <p role="status" className="mt-3 text-sm text-purple-200">{stage}</p>}
    {open && (result ? <div className="mt-4 space-y-4"><p>Order created: <strong>{result.orderNumber}</strong> · {result.fullName}</p><ManualPaymentPanel order={result} onUpdate={setResult} generating={busy} /><button type="button" className="rounded border px-3 py-2 text-sm" disabled={busy} onClick={() => { setResult(null); pendingRequest.current = null; setError(""); setItems([]); setShipping(0); setDiscount(0); }}>Create another order</button></div> :
      <form onSubmit={submit} className="mt-4 space-y-4">{repeat && <div role="status" className="rounded-xl border border-purple-300/20 bg-purple-300/5 p-3 text-sm text-purple-100"><p>New order at current prices. Review items and delivery details. Payment, discounts and tracking start fresh.</p>{repeat.notices.map((notice, index) => <p key={index} className="mt-2 text-amber-200">{notice}</p>)}</div>}<fieldset disabled={busy || !!pendingRequest.current} className="space-y-4 disabled:opacity-60">
        <div className="grid gap-3 sm:grid-cols-2">{[{ name: "fullName", label: "Customer name", required: true }, { name: "phone", label: "Mobile number", type: "tel", required: true }, { name: "email", label: "Email (optional)", type: "email" }, { name: "addressLine1", label: "Street address", required: true }, { name: "addressLine2", label: "Apartment / landmark (optional)" }, { name: "city", label: "City", required: true }, { name: "state", label: "State", required: true }, { name: "pincode", label: "Pincode", required: true }].map(field => <label key={field.name} className="space-y-1 text-sm"><span>{field.label}</span><input className={inputClass} name={field.name} defaultValue={contact?.[field.name as keyof CustomerContact] || ''} type={field.type || "text"} required={field.required} placeholder={field.name === "phone" ? "9876543210 or +91 98765 43210" : undefined} autoComplete={field.name === "phone" ? "tel" : undefined} />{field.name === "phone" && <span className="block text-xs text-white/55">10-digit Indian mobile number; +91 and spaces are accepted.</span>}</label>)}</div>
        {items.map((item, index) => {
          const product = available.find(p => p.id === item.id);
          const image = isDiscoverySetProductId(item.id) ? DISCOVERY_SET_IMAGES[0] : product?.images?.[0];
          return <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">{image ? <Image src={image} alt={product?.name || "Product"} fill unoptimized sizes="56px" className="object-cover" /> : <span className="text-xs text-white/50">No image</span>}</span>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium">{product?.name}</p><p className="text-xs text-white/60">₹{isDiscoverySetProductId(item.id) ? DISCOVERY_SET_PRICE : product?.price} each</p>{item.sampleSelections?.length ? <p className="mt-1 text-xs leading-5 text-white/60">{item.sampleSelections.map(id => products.find(p => p.id === id)?.name).filter((name): name is string => !!name).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true })).join(", ")}</p> : null}</div>
            <input aria-label={`Quantity for ${product?.name}`} type="number" min="1" max="20" required value={item.quantity} className="w-20 rounded-lg border border-white/15 bg-black/20 px-2 py-2" onChange={e => setItems(current => current.map((row, i) => i === index ? { ...row, quantity: Number(e.target.value) } : row))} />
            <button type="button" aria-label={`Remove ${product?.name}`} onClick={() => setItems(current => current.filter((_, i) => i !== index))} className="px-2 text-rose-200">×</button>
          </div>;
        })}
        {items.length < 20 && <OrderProductPicker products={available} onAdd={(product, samples) => setItems(current => {
          const existing = current.findIndex(item => item.id === product.id);
          if (existing >= 0) return current.map((item, index) => index === existing ? { ...item, quantity: Math.min(20, item.quantity + 1), ...(samples.length ? { sampleSelections: samples.map(sample => sample.id) } : {}) } : item);
          return [...current, { id: product.id, quantity: 1, ...(samples.length ? { sampleSelections: samples.map(sample => sample.id) } : {}) }];
        })} />}
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Shipping fee (₹)<input className={inputClass} type="number" min="0" max="10000" step="0.01" value={shipping} onChange={e => setShipping(Number(e.target.value))} /></label><label className="text-sm">Discount (₹)<input className={inputClass} type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></label></div>
        <label className="block text-sm">Discount reason<input name="adjustmentReason" required={discount > 0} className={inputClass} /></label>
        <label className="block text-sm">Order notes<textarea name="notes" className={inputClass} /></label>
        <label className="block text-sm">Payment option<select value={mode} onChange={e => setMode(e.target.value)} className={inputClass}><option value="full">100% online payment</option><option value="partial_cod">20% online advance + 80% COD</option><option value="already_paid">Already paid · Confirmed order</option></select></label>
        {mode==='already_paid'&&<><label className="block text-sm">Received through<select name="receiptMethod" className={inputClass}><option value="upi_qr">UPI / personal QR</option><option value="bank_transfer">Bank transfer</option><option value="cash">Cash</option></select></label><label className="block text-sm">Payment reference / receipt note<input name="receiptReference" required minLength={3} maxLength={200} className={inputClass}/></label><label className="flex items-start gap-2 text-xs text-white/65"><input type="checkbox" required/>I verified that the full amount was received. No payment link or COD collection is needed.</label></>}
        <p className="text-sm">Total {money(total)} · {mode==='already_paid'?'Already received':'Online'} {money(advance)} · COD {money(total - advance)}</p>
        <p className="text-xs text-muted-foreground">{mode==='already_paid'?'Creates a confirmed, fully paid entry with an audit receipt. No payment request is generated.':'Creates a pending order and a payment link. Copy and share the link yourself; no message is sent automatically.'}</p>
      </fieldset>
        {pendingRequest.current && !busy && <p className="text-sm text-amber-100">Retry will use the original submitted details to recover the same order safely.</p>}
        <button disabled={busy || !items.length || total < 100} type="submit" className="rounded-lg bg-purple-500 px-4 py-2 font-medium text-white disabled:opacity-40">{busy ? stage : pendingRequest.current ? "Retry same order" : mode==='already_paid'?'Create confirmed order':"Create order & payment link"}</button>
      </form>)}
  </section>;
}
