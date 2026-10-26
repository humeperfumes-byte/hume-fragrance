import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, secureCheckoutSessions } from "@/db/schema";
import { resolveCustomerLink } from "@/lib/customer-access-links";
import { customerOrderView } from "@/lib/customer-order-view";
import { reportServerError } from "@/lib/server-error-monitoring";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your HUME order", robots: { index: false, follow: false }, referrer: "no-referrer" };
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
export default async function CustomerOrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let resourceId: string | null;
  try { resourceId = await resolveCustomerLink(token, "order"); } catch { reportServerError("CUSTOMER_LINK_FAILED"); resourceId = null; }
  if (!resourceId) notFound();
  const order = await db.select().from(orders).where(eq(orders.id, resourceId)).limit(1)
    .then(rows => rows[0]).catch(() => { reportServerError("CUSTOMER_LINK_FAILED"); return null; });
  if (!order) notFound();
  const [checkout] = await db.select({ expectedMinor: secureCheckoutSessions.expectedPaymentMinor }).from(secureCheckoutSessions).where(eq(secureCheckoutSessions.orderId, order.id)).limit(1);
  const view = customerOrderView(order, checkout?.expectedMinor);
  return <main className="min-h-screen bg-[#f7f7f8] px-4 py-12 text-zinc-950"><div className="mx-auto max-w-2xl space-y-6"><Link href="/" className="text-sm font-semibold tracking-[0.2em]">HUME FRAGRANCE</Link><section className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-9"><p className="text-xs uppercase tracking-widest text-zinc-500">Your order</p><h1 className="text-3xl font-semibold">#{view.orderNumber}</h1><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-zinc-50 p-4"><p className="text-xs text-zinc-500">Order progress</p><p className="mt-1 font-semibold capitalize">{view.status === "processing" ? "Preparing your order" : view.status}</p></div><div className="rounded-xl bg-zinc-50 p-4"><p className="text-xs text-zinc-500">Payment</p><p className="mt-1 font-semibold">{view.payment}</p></div></div><h2 className="font-semibold">Items</h2><ul className="divide-y divide-zinc-100">{view.items.map((item, index) => <li key={index} className="py-4"><div className="flex justify-between gap-3"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-sm text-zinc-500">{item.size} · Quantity {item.quantity}</p></div><span className="shrink-0 text-sm">{item.isGift ? "Complimentary" : money(item.price * item.quantity)}</span></div>{item.selections.length > 0 && <p className="mt-2 text-sm leading-6 text-zinc-600">Fragrances: {item.selections.join(", ")}</p>}</li>)}</ul>{view.codFee > 0 && <div className="flex justify-between text-sm text-zinc-600"><span>COD charge (included)</span><span>{money(view.codFee)}</span></div>}<div className="flex justify-between border-t pt-4 text-lg font-semibold"><span>Order total</span><span>{money(view.total)}</span></div>{view.received > 0 && <p className="text-sm">Online payment received: {money(view.received)}</p>}{view.codBalance !== null && <p className="text-sm">Pay on delivery: {money(view.codBalance)}</p>}<p className="text-sm text-zinc-600">Delivery location: {view.city || "Saved with HUME"}</p>{view.trackingNumber ? <div className="rounded-xl bg-emerald-50 p-4 text-sm"><p className="font-semibold">Shipment tracking</p><p className="mt-1">{view.carrier} · {view.trackingNumber}</p><p className="mt-2">{view.trackingStatus ? `Delivery status: ${view.trackingStatus.replace(/_/g, " ")}` : "Contact us for the latest delivery update."}</p></div> : <p className="text-sm text-zinc-500">Tracking details will appear after dispatch.</p>}<p className="text-xs leading-5 text-zinc-500">Your full address and contact details are kept private. Sign in to your account to view personal information.</p><div className="flex flex-wrap gap-3"><Link href="/account" className="rounded-full bg-black px-5 py-3 text-sm text-white">My account</Link><a href="https://wa.me/919559024822" target="_blank" rel="noreferrer" className="rounded-full border px-5 py-3 text-sm">Contact HUME</a></div></section></div></main>;
}
