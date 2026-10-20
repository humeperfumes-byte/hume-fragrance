import "server-only";
import { DISCOVERY_SET_PRODUCT_ID, DISCOVERY_SET_PRICE, DISCOVERY_SET_IMAGES, DISCOVERY_SET_SIZE, isEligibleDiscoverySample } from "./discovery-set";
import { randomUUID, createHash } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, orderEditAudits, type Order } from "@/db/schema";
import { MANUAL_LINK_CHANNEL, manualOrderSchema, manualPaymentAmounts, readManualPayment, writeManualPayment, validateManualLink, manualPaymentNextStatus } from "./manual-order";
import {externalPaymentPatch,isExternallySettled} from './external-order-payment';

type Link = { id: string; short_url: string; reference_id: string; amount: number; amount_paid: number; currency: string; status: string; order_id?: string; payments?: { payment_id: string }[] };
export class ManualOrderError extends Error {}
class ProviderError extends ManualOrderError { constructor(public status: number) { super(status >= 400 && status < 500 && status !== 429 ? `Razorpay rejected the payment-link request (${status}). Check customer details and Razorpay credentials, then retry on this saved order.` : "Razorpay could not complete this request. Retry to recover the existing link; do not create another order."); } }
async function provider(path: string, body?: unknown): Promise<Link> {
  const { RAZORPAY_KEY_ID: key, RAZORPAY_KEY_SECRET: secret } = process.env;
  if (!key || !secret) throw new ManualOrderError("Razorpay credentials are not configured");
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new ProviderError(response.status);
  return response.json();
}
export async function loadManualOrder(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || order.checkoutChannel !== MANUAL_LINK_CHANNEL) throw new ManualOrderError("Manual payment-link order not found");
  return order;
}
export async function createManualOrder(raw: unknown) {
  const input = manualOrderSchema.parse(raw);
  const requestFingerprint = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const [existing] = await db.select().from(orders).where(eq(orders.id, input.requestId)).limit(1);
  if (existing) {
    if (existing.checkoutChannel !== MANUAL_LINK_CHANNEL || existing.sessionId !== `manual-${input.requestId}`) throw new ManualOrderError("Request ID is already in use");
    if (readManualPayment(existing.whatsappMessage)?.requestFingerprint !== requestFingerprint) throw new ManualOrderError("This request already created an order. Open that order before changing details or creating another.");
    return existing;
  }
  if (new Set(input.items.map(item => item.id)).size !== input.items.length) throw new ManualOrderError("Select each perfume once and use its quantity field");
  if (input.discount && !input.adjustmentReason) throw new ManualOrderError("Add a reason for the discount");
  if (input.repeatOf) {
    const [source] = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, input.repeatOf)).limit(1);
    if (!source) throw new ManualOrderError('The original order was not found. Refresh customer history.');
  }
  const catalogue = await db.select().from(products).where(inArray(products.id, [...new Set(input.items.flatMap(item => [item.id, ...(item.sampleSelections || [])]))]));
  const cartSnapshot = input.items.map(item => {
    const product = catalogue.find(p => p.id === item.id);
    if (!product || product.priceCurrency !== "INR") throw new ManualOrderError("One of the selected products is unavailable for an INR manual order");
    if (input.repeatOf && (product.badges?.soldOut || product.badges?.comingSoon)) throw new ManualOrderError(`${product.name} is no longer available. Remove it or choose a replacement.`);
    const discovery = product.id === DISCOVERY_SET_PRODUCT_ID;
    const sampleSelections = discovery ? (item.sampleSelections || []).map(id => {
      const sample = catalogue.find(p => p.id === id);
      if (!sample || sample.id === DISCOVERY_SET_PRODUCT_ID) throw new ManualOrderError("A discovery sample is missing from the catalogue");
      if (input.repeatOf && !isEligibleDiscoverySample(sample)) throw new ManualOrderError(`${sample.name} is no longer available as a discovery sample. Rebuild the set.`);
      return { id: sample.id, name: sample.name, inspiration: sample.inspiration };
    }) : undefined;
    const price = discovery ? DISCOVERY_SET_PRICE : Number(product.price);
    if (!Number.isFinite(price) || price <= 0) throw new ManualOrderError("Product price is invalid");
    return { id: product.id, name: product.name, price, quantity: item.quantity, image: discovery ? DISCOVERY_SET_IMAGES[0] : product.images[0], inspiration: product.inspiration, size: discovery ? DISCOVERY_SET_SIZE : product.size, ...(sampleSelections ? { sampleSelections } : {}) };
  });
  const subtotalMinor = cartSnapshot.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  const shippingMinor = Math.round(input.shippingFee * 100), discountMinor = Math.round(input.discount * 100);
  if (discountMinor > subtotalMinor) throw new ManualOrderError("Discount cannot exceed the perfume subtotal");
  let amounts: ReturnType<typeof manualPaymentAmounts>;
  try { amounts = manualPaymentAmounts(subtotalMinor + shippingMinor - discountMinor, input.paymentMode === 'already_paid' ? 'full' : input.paymentMode); }
  catch (error) { throw new ManualOrderError(error instanceof Error ? error.message : "Invalid order total"); }
  const payment = { ...amounts, requestFingerprint };
  let externalPatch:Partial<typeof orders.$inferInsert> = {};
  if(input.paymentMode === 'already_paid') {
    try {externalPatch = externalPaymentPatch({grandTotal:payment.totalMinor/100,status:'payment_pending'}, {amountMinor:payment.totalMinor,method:input.receiptMethod || 'upi_qr',reference:input.receiptReference || ''});}
    catch(error){throw new ManualOrderError(error instanceof Error ? error.message : 'Add the external payment receipt');}
  }
  const created = await db.transaction(async tx=>{
  const [record] = await tx.insert(orders).values({ id: input.requestId, orderNumber: `HME-M-${randomUUID().slice(0, 12).toUpperCase()}`, sessionId: `manual-${input.requestId}`, checkoutChannel: MANUAL_LINK_CHANNEL, status: "payment_pending", paymentSyncStatus: "link_pending", paymentMethod: input.paymentMode === "partial_cod" ? "20% Prepaid + 80% Cash on Delivery" : "Razorpay Payment Link", fullName: input.fullName, phone: input.phone, email: input.email || null, addressLine1: input.addressLine1, addressLine2: input.addressLine2, city: input.city, state: input.state, pincode: input.pincode, notes: input.notes, country: "IN", acquisitionSource: "admin", acquisitionCategory: "manual", path: "/admin/orders", cartSnapshot, subtotal: (subtotalMinor / 100).toFixed(2), shippingFee: (shippingMinor / 100).toFixed(2), manualAdjustment: (-discountMinor / 100).toFixed(2), adjustmentReason: input.adjustmentReason, grandTotal: (payment.totalMinor / 100).toFixed(2), whatsappMessage: writeManualPayment(null, payment), ...externalPatch }).onConflictDoNothing({ target: orders.id }).returning();
  if(record && input.paymentMode === 'already_paid')await tx.insert(orderEditAudits).values({id:randomUUID(),orderId:record.id,changeType:'external_payment',actor:'admin',reason:`Created confirmed, fully paid order: ${input.receiptMethod || 'upi_qr'}; ${input.receiptReference}`,beforeSnapshot:{},afterSnapshot:record});
  return record;
  });
  const saved = created ?? await loadManualOrder(input.requestId);
  if (readManualPayment(saved.whatsappMessage)?.requestFingerprint !== requestFingerprint) throw new ManualOrderError("This request already created an order with different details");
  return saved;
}
export async function ensureManualPaymentLink(id: string) {
  let order = await loadManualOrder(id);
  if(isExternallySettled(order))throw new ManualOrderError('This order is fully paid. No payment link is needed.');
  const payment = readManualPayment(order.whatsappMessage);
  if (!payment) throw new ManualOrderError("Payment details are missing");
  if (payment.linkId) return { order, payment };
  if (order.status !== "payment_pending") throw new ManualOrderError("This order cannot receive a new payment link");
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new ManualOrderError("Razorpay credentials are not configured");
  // Claim creation once. If the network response is lost, recover by reference rather than charging twice.
  const [claim] = await db.update(orders).set({ paymentSyncStatus: "link_creating", updatedAt: new Date() }).where(and(eq(orders.id, id), eq(orders.status, "payment_pending"), eq(orders.paymentSyncStatus, "link_pending"))).returning();
  let link: Link;
  if (claim) {
    try {
      link = await provider("payment_links", { amount: payment.advanceMinor, currency: "INR", accept_partial: false, reference_id: id, description: `HUME ${order.orderNumber}${payment.mode === "partial_cod" ? " — 20% advance" : ""}`, customer: { name: order.fullName, contact: order.phone, ...(order.email ? { email: order.email } : {}) }, notify: { sms: false, email: false }, reminder_enable: false, notes: { humeOrderId: id, humeOrderNumber: order.orderNumber, paymentMode: payment.mode } });
    } catch (error) {
      // Explicit client rejections cannot create a link. Unknown outcomes stay claimed for recovery.
      if (error instanceof ProviderError && error.status >= 400 && error.status < 500 && error.status !== 429) await db.update(orders).set({ paymentSyncStatus: "link_pending" }).where(and(eq(orders.id, id), eq(orders.paymentSyncStatus, "link_creating")));
      throw error;
    }
  } else {
    const result = await provider(`payment_links?reference_id=${encodeURIComponent(id)}`) as unknown as { payment_links: Link[] };
    const found = result.payment_links?.find(item => item.reference_id === id);
    if (!found) throw new ManualOrderError("Link creation is still pending or needs Razorpay support. Retry shortly to recover it using this order's reference; do not create a duplicate order.");
    link = found;
  }
  validateManualLink(payment, link, id);
  const saved = { ...payment, linkId: link.id, url: link.short_url };
  order = await db.transaction(async tx => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    const [updated] = await tx.update(orders).set({ whatsappMessage: writeManualPayment(current.whatsappMessage, saved), razorpayOrderId: link.order_id ?? current.razorpayOrderId, paymentSyncStatus: current.paymentCapturedAt ? current.paymentSyncStatus : "link_created", updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return updated;
  });
  return { order, payment: saved };
}
export async function reconcileManualPayment(id: string) {
  const original = await loadManualOrder(id), payment = readManualPayment(original.whatsappMessage);
  if (!payment?.linkId) throw new ManualOrderError("Generate or recover the payment link first");
  const link = await provider(`payment_links/${encodeURIComponent(payment.linkId)}`);
  const paid = validateManualLink(payment, link, id);
  const syncStatus = paid ? "captured" : link.status;
  const order = await db.transaction(async tx => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    const status = manualPaymentNextStatus(current.status, paid);
    const nextSync = !paid && current.paymentCapturedAt ? current.paymentSyncStatus : syncStatus;
    const [updated] = await tx.update(orders).set({ status, paymentSyncStatus: nextSync, paymentReconciledAt: new Date(), razorpayOrderId: link.order_id ?? current.razorpayOrderId, ...(paid ? { capturedPaymentAmount: (payment.advanceMinor / 100).toFixed(2), paymentCapturedAt: current.paymentCapturedAt ?? new Date(), razorpayPaymentId: link.payments?.[0]?.payment_id ?? current.razorpayPaymentId } : {}), updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    if (current.paymentSyncStatus !== nextSync || current.status !== status) await tx.insert(orderEditAudits).values({ id: randomUUID(), orderId: id, changeType: "payment_reconciliation", actor: "razorpay", reason: `Payment link checked: ${nextSync}`, beforeSnapshot: current, afterSnapshot: updated });
    return updated;
  });
  return { order, syncStatus: order.paymentSyncStatus || syncStatus, capturedAmount: Number(order.capturedPaymentAmount || 0), expectedAmount: payment.advanceMinor / 100, difference: Number(order.capturedPaymentAmount || 0) - payment.advanceMinor / 100, providerOrders: 1, capturedPayments: paid ? 1 : 0, changed: original.status !== order.status };
}
export async function cancelManualLink(order: Order) {
  await db.transaction(async tx => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, order.id)).for("update");
    const payment = readManualPayment(current.whatsappMessage);
    if (payment?.linkId) {
      const link = await provider(`payment_links/${encodeURIComponent(payment.linkId)}`);
      if (["created", "partially_paid"].includes(link.status)) await provider(`payment_links/${encodeURIComponent(payment.linkId)}/cancel`, {});
      else if (link.status === "paid" && Math.round(Number(current.capturedPaymentAmount || 0) * 100) < payment.advanceMinor) throw new ManualOrderError("Payment has been received. Reconcile this order before cancelling and handle any refund separately.");
    } else if (current.paymentSyncStatus === "link_creating") throw new ManualOrderError("Recover the pending payment link before cancelling this order");
    const [cancelled] = await tx.update(orders).set({ status: "cancelled", updatedAt: new Date() }).where(eq(orders.id, order.id)).returning();
    if (current.status !== "cancelled") await tx.insert(orderEditAudits).values({ id: randomUUID(), orderId: order.id, actor: "admin", changeType: "payment_link_cancellation", reason: "Order cancelled after checking or revoking its payment link", beforeSnapshot: current, afterSnapshot: cancelled });
  });
}

/** Revoke an unpaid shared link before an admin records the money elsewhere. */
export async function closeManualLinkForExternalPayment(order: Order) {
  if(order.checkoutChannel!==MANUAL_LINK_CHANNEL)return;
  const payment=readManualPayment(order.whatsappMessage);
  if(!payment?.linkId){if(order.paymentSyncStatus==='link_creating')throw new ManualOrderError('Recover the in-progress payment link first, then record the external receipt.');return;}
  const link=await provider(`payment_links/${encodeURIComponent(payment.linkId)}`);
  validateManualLink(payment,link,order.id);
  if(link.status==='paid'){
    if(Math.round(Number(order.capturedPaymentAmount||0)*100)<payment.advanceMinor)throw new ManualOrderError('Razorpay also received a payment. Choose Check Razorpay payment first, then record only the remaining external balance.');
    return;
  }
  if(Number(link.amount_paid)>0)throw new ManualOrderError('This payment link has a partial receipt. Reconcile it before recording another payment.');
  if(['created','partially_paid'].includes(link.status))await provider(`payment_links/${encodeURIComponent(payment.linkId)}/cancel`,{});
}
