import "server-only";
import { randomUUID, createHash } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, orderEditAudits, type Order } from "@/db/schema";
import { MANUAL_LINK_CHANNEL, manualOrderSchema, manualPaymentAmounts, readManualPayment, writeManualPayment, validateManualLink, manualPaymentNextStatus } from "./manual-order";

type Link = { id: string; short_url: string; reference_id: string; amount: number; amount_paid: number; currency: string; status: string; order_id?: string; payments?: { payment_id: string }[] };
export class ManualOrderError extends Error {}
class ProviderError extends ManualOrderError { constructor(public status: number) { super("Razorpay could not complete this request. Retry to recover the existing link; do not create another order."); } }
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
    if (existing.fullName !== input.fullName || existing.phone !== input.phone || existing.addressLine1 !== input.addressLine1 || JSON.stringify(existing.cartSnapshot.map(item => ({ id: item.id, quantity: item.quantity }))) !== JSON.stringify(input.items)) throw new ManualOrderError("This request already created an order with different details. Open the existing order before creating another.");
    return existing;
  }
  if (new Set(input.items.map(item => item.id)).size !== input.items.length) throw new ManualOrderError("Select each perfume once and use its quantity field");
  if (input.discount && !input.adjustmentReason) throw new ManualOrderError("Add a reason for the discount");
  const catalogue = await db.select().from(products).where(inArray(products.id, input.items.map(item => item.id)));
  const cartSnapshot = input.items.map(item => {
    const product = catalogue.find(p => p.id === item.id);
    if (!product || product.visibility !== "public" || product.badges.soldOut || product.badges.comingSoon || /discovery|kit|sample set/i.test(`${product.id} ${product.name}`) || product.priceCurrency !== "INR") throw new ManualOrderError("One of the selected perfumes is unavailable for a manual order");
    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) throw new ManualOrderError("Product price is invalid");
    return { id: product.id, name: product.name, price, quantity: item.quantity, image: product.images[0], inspiration: product.inspiration, size: product.size };
  });
  const subtotalMinor = cartSnapshot.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
  const shippingMinor = Math.round(input.shippingFee * 100), discountMinor = Math.round(input.discount * 100);
  if (discountMinor > subtotalMinor) throw new ManualOrderError("Discount cannot exceed the perfume subtotal");
  let amounts: ReturnType<typeof manualPaymentAmounts>;
  try { amounts = manualPaymentAmounts(subtotalMinor + shippingMinor - discountMinor, input.paymentMode); }
  catch (error) { throw new ManualOrderError(error instanceof Error ? error.message : "Invalid order total"); }
  const payment = { ...amounts, requestFingerprint };
  const [created] = await db.insert(orders).values({ id: input.requestId, orderNumber: `HME-M-${randomUUID().slice(0, 12).toUpperCase()}`, sessionId: `manual-${input.requestId}`, checkoutChannel: MANUAL_LINK_CHANNEL, status: "payment_pending", paymentSyncStatus: "link_pending", paymentMethod: input.paymentMode === "partial_cod" ? "20% Prepaid + 80% Cash on Delivery" : "Razorpay Payment Link", fullName: input.fullName, phone: input.phone, email: input.email || null, addressLine1: input.addressLine1, addressLine2: input.addressLine2, city: input.city, state: input.state, pincode: input.pincode, notes: input.notes, country: "IN", acquisitionSource: "admin", acquisitionCategory: "manual", path: "/admin/orders", cartSnapshot, subtotal: (subtotalMinor / 100).toFixed(2), shippingFee: (shippingMinor / 100).toFixed(2), manualAdjustment: (-discountMinor / 100).toFixed(2), adjustmentReason: input.adjustmentReason, grandTotal: (payment.totalMinor / 100).toFixed(2), whatsappMessage: writeManualPayment(null, payment) }).onConflictDoNothing({ target: orders.id }).returning();
  const saved = created ?? await loadManualOrder(input.requestId);
  if (readManualPayment(saved.whatsappMessage)?.requestFingerprint !== requestFingerprint) throw new ManualOrderError("This request already created an order with different details");
  return saved;
}
export async function ensureManualPaymentLink(id: string) {
  let order = await loadManualOrder(id);
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
      // Authentication rejection cannot have created a link. Unknown responses remain claimed for recovery.
      if (error instanceof ProviderError && [401, 403].includes(error.status)) await db.update(orders).set({ paymentSyncStatus: "link_pending" }).where(and(eq(orders.id, id), eq(orders.paymentSyncStatus, "link_creating")));
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
