import { getStoredOrderDiscount, preserveOrderItem } from "@/lib/order-edit-pricing";
import { DISCOVERY_SET_PRODUCT_ID, DISCOVERY_SET_SAMPLE_COUNT, DISCOVERY_SET_PRICE, DISCOVERY_SET_IMAGES, DISCOVERY_SET_SIZE, isDiscoverySetCartItemId } from "@/lib/discovery-set";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coupons, orderEditAudits, orders, products, razorpayWebhookEvents, secureCheckoutSessions } from "@/db/schema";
import { expectedPaymentMinor } from "@/lib/secure-checkout-pricing";
import { requireAdminToken } from "@/lib/admin-auth";
import { calculateCouponDiscount } from "@/lib/cart-discounts";
import { displayPhoneNumber } from "@/lib/phone";
import { MANUAL_LINK_CHANNEL, readManualPayment } from "@/lib/manual-order";
import { cancelManualLink } from "@/lib/manual-order-payment";

const itemSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), image: z.string().optional(), inspiration: z.string().optional(), size: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(100), price: z.coerce.number().nonnegative(), isGift: z.boolean().optional(),
  kitSelections: z.array(z.object({ id: z.string(), name: z.string(), inspiration: z.string().optional() })).optional(),
  sampleSelections: z.array(z.object({ id: z.string(), name: z.string(), inspiration: z.string().optional() })).optional(),
});

const patchSchema = z.object({
  expectedUpdatedAt: z.string().datetime().optional(),
  fullName: z.string().trim().max(255).optional(), phone: z.string().trim().max(50).optional(), alternatePhone: z.string().trim().max(50).optional(),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(), addressLine1: z.string().trim().max(1000).optional(), addressLine2: z.string().trim().max(1000).optional(),
  city: z.string().trim().max(255).optional(), state: z.string().trim().max(255).optional(), pincode: z.union([z.string().regex(/^\d{6}$/, "Pincode must contain 6 digits"), z.literal("")]).optional(),
  notes: z.string().trim().max(2000).optional(), paymentMethod: z.string().trim().max(100).optional(), shippingMethod: z.string().trim().max(100).optional(),
  fulfillmentCarrier: z.string().trim().max(100).optional(), trackingNumber: z.string().trim().max(120).optional(), trackingUrl: z.string().trim().max(2048).optional(), trackingStatus: z.string().trim().max(80).optional(),
  status: z.enum(["whatsapp_initiated", "payment_pending", "payment_authorized", "payment_failed", "processing", "packed", "shipped", "delivered", "complete", "cancelled"]).optional(),
  appliedCouponCode: z.string().trim().max(50).optional(), shippingFee: z.coerce.number().nonnegative().optional(), manualAdjustment: z.coerce.number().min(-100000).max(100000).optional(),
  adjustmentReason: z.string().trim().max(500).optional(), editReason: z.string().trim().max(500).optional(), cartSnapshot: z.array(itemSchema).min(1).optional(), giftItems: z.array(z.string()).optional(),
  shippedAt: z.string().datetime().optional(), deliveredAt: z.string().datetime().optional(), trackingLastCheckedAt: z.string().datetime().optional(),
}).strict();

const paidStatuses = new Set(["payment_authorized", "processing", "packed", "shipped", "delivered", "complete"]);
const money = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0;

async function getCapturedAmount(orderId: string) {
  const [row] = await db.select({ amount: sql<string | null>`max(${razorpayWebhookEvents.amount})` }).from(razorpayWebhookEvents)
    .where(and(eq(razorpayWebhookEvents.localOrderId, orderId), sql`lower(coalesce(${razorpayWebhookEvents.status}, '')) in ('captured','authorized','paid')`));
  return money(row?.amount) / 100;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(req); if (unauthorized) return unauthorized;
  try {
    const { id } = await params; const input = patchSchema.parse(await req.json());
    for (const field of ["fullName", "phone", "addressLine1", "city", "state", "pincode"] as const) {
      if (input[field] !== undefined && !input[field]?.trim()) return NextResponse.json({ error: `${field} cannot be empty` }, { status: 400 });
    }
    if (input.phone && !/^\d{10,15}$/.test(input.phone.replace(/\D/g, ""))) return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
    const [current] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (input.expectedUpdatedAt && input.expectedUpdatedAt !== current.updatedAt.toISOString()) return NextResponse.json({ error: "This order changed in another session. Refresh and try again." }, { status: 409 });
    const financialChange = (input.cartSnapshot !== undefined && JSON.stringify(input.cartSnapshot) !== JSON.stringify(current.cartSnapshot))
      || (input.appliedCouponCode !== undefined && input.appliedCouponCode.trim().toUpperCase() !== (current.appliedCouponCode || "").trim().toUpperCase())
      || (input.shippingFee !== undefined && money(input.shippingFee) !== money(current.shippingFee))
      || (input.manualAdjustment !== undefined && money(input.manualAdjustment) !== money(current.manualAdjustment));
    if (current.checkoutChannel === MANUAL_LINK_CHANNEL) {
      if (financialChange || (input.paymentMethod !== undefined && input.paymentMethod !== current.paymentMethod)) return NextResponse.json({ error: "Payment-link totals and payment mode are locked. Cancel the unpaid order and create a corrected order." }, { status: 400 });
      const payment = readManualPayment(current.whatsappMessage);
      if (input.status && paidStatuses.has(input.status) && (!payment || Math.round(Number(current.capturedPaymentAmount || 0) * 100) < payment.advanceMinor)) return NextResponse.json({ error: "Check Razorpay payment before processing or shipping this order" }, { status: 400 });
      if (input.status === "cancelled" && current.status !== "cancelled") await cancelManualLink(current);
    }
    if (financialChange && paidStatuses.has(current.status) && !input.editReason?.trim()) return NextResponse.json({ error: "A reason is required when changing a paid order" }, { status: 400 });
    if (process.env.ENABLE_SECURE_CHECKOUT === "true" && current.checkoutChannel === "razorpay" && input.paymentMethod !== undefined && input.paymentMethod !== current.paymentMethod && (current.razorpayOrderId || current.paymentCapturedAt || current.paymentSyncStatus === "creating")) return NextResponse.json({ error: "Payment mode is locked after a payment request starts" }, { status: 409 });

    const itemsOrCouponChanged = (input.cartSnapshot !== undefined && JSON.stringify(input.cartSnapshot) !== JSON.stringify(current.cartSnapshot)) || (input.appliedCouponCode !== undefined && input.appliedCouponCode.trim().toUpperCase() !== (current.appliedCouponCode || "").trim().toUpperCase());
    const nextItems = input.cartSnapshot ?? current.cartSnapshot;
    const ids = [...new Set(nextItems.flatMap(item => isDiscoverySetCartItemId(item.id) ? [DISCOVERY_SET_PRODUCT_ID, ...(item.sampleSelections || []).map(sample => sample.id)] : [item.id]))];
    const catalogue = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : [];
    const productMap = new Map(catalogue.map((product) => [product.id, product]));
    const currentIds = new Set(current.cartSnapshot.map((item) => item.id));
    const repricedItems = financialChange ? nextItems.map((item) => {
      if (isDiscoverySetCartItemId(item.id) && !current.cartSnapshot.some(saved => saved.id === item.id)) {
        const samples = item.sampleSelections || [];
        if (samples.length !== DISCOVERY_SET_SAMPLE_COUNT || new Set(samples.map(sample => sample.id)).size !== DISCOVERY_SET_SAMPLE_COUNT) throw new Error(`Choose ${DISCOVERY_SET_SAMPLE_COUNT} different discovery samples`);
        const verifiedSamples = samples.map(sample => {
          const perfume = productMap.get(sample.id);
          if (!perfume || perfume.id === DISCOVERY_SET_PRODUCT_ID) throw new Error("A selected discovery sample is unavailable in the catalogue");
          return { id: perfume.id, name: perfume.name, inspiration: perfume.inspiration };
        });
        return { ...item, name: "HUME Discovery Set", price: DISCOVERY_SET_PRICE, size: DISCOVERY_SET_SIZE, image: DISCOVERY_SET_IMAGES[0], sampleSelections: verifiedSamples };
      }
      if (item.isGift || item.kitSelections?.length || item.sampleSelections?.length) return item;
      const original = preserveOrderItem(item, current.cartSnapshot);
      if (original) return original;
      const product = productMap.get(item.id);
      if (!product) { if (currentIds.has(item.id)) return item; throw new Error(`Product ${item.name} is no longer available`); }
      return { ...item, name: product.name, inspiration: product.inspiration, size: product.size, image: product.images?.[0], price: money(product.price) };
    }) : current.cartSnapshot;
    const subtotal = itemsOrCouponChanged ? repricedItems.filter((item) => !item.isGift).reduce((sum, item) => sum + money(item.price) * item.quantity, 0) : money(current.subtotal);
    const couponCode = (input.appliedCouponCode ?? current.appliedCouponCode ?? "").split(",")[0].trim().toUpperCase();
    let couponDiscount = getStoredOrderDiscount(current);
    if (itemsOrCouponChanged) couponDiscount = 0;
    if (itemsOrCouponChanged && couponCode) {
      const [coupon] = await db.select().from(coupons).where(and(eq(coupons.code, couponCode), eq(coupons.active, true), sql`${coupons.archivedAt} is null`)).limit(1);
      if (!coupon) return NextResponse.json({ error: `Coupon ${couponCode} is invalid or archived` }, { status: 400 });
      couponDiscount = calculateCouponDiscount({ ...coupon, value: money(coupon.value), minSubtotal: money(coupon.minSubtotal) }, repricedItems, subtotal).discount;
    }
    const shippingFee = input.shippingFee ?? money(current.shippingFee); const manualAdjustment = input.manualAdjustment ?? money(current.manualAdjustment);
    if (financialChange && manualAdjustment !== 0 && !(input.adjustmentReason ?? current.adjustmentReason)?.trim()) return NextResponse.json({ error: "Manual adjustments require a reason" }, { status: 400 });
    const grandTotal = financialChange ? Math.max(0, subtotal - Math.min(subtotal, couponDiscount) + shippingFee + manualAdjustment) : money(current.grandTotal);
    const patch = {
      ...input, cartSnapshot: financialChange ? repricedItems : undefined, appliedCouponCode: itemsOrCouponChanged ? couponCode || null : undefined, subtotal: financialChange ? subtotal.toFixed(2) : undefined, shippingFee: financialChange ? shippingFee.toFixed(2) : undefined, manualAdjustment: financialChange ? manualAdjustment.toFixed(2) : undefined, grandTotal: financialChange ? grandTotal.toFixed(2) : undefined, updatedAt: new Date(),
      phone: input.phone === undefined ? undefined : (displayPhoneNumber(input.phone) || null), alternatePhone: input.alternatePhone === undefined ? undefined : (displayPhoneNumber(input.alternatePhone) || null), email: input.email === undefined ? undefined : (input.email || null),
      expectedUpdatedAt: undefined, editReason: undefined, shippedAt: input.shippedAt ? new Date(input.shippedAt) : undefined, deliveredAt: input.deliveredAt ? new Date(input.deliveredAt) : undefined, trackingLastCheckedAt: input.trackingLastCheckedAt ? new Date(input.trackingLastCheckedAt) : undefined,
    };
    const updated = await db.transaction(async (tx) => {
      if (current.sessionId) await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${current.sessionId}))`);
      const [order] = await tx.update(orders).set(patch).where(and(eq(orders.id, id), eq(orders.updatedAt, current.updatedAt))).returning();
      if (!order) throw new Error("This order changed in another session. Refresh and try again.");
      // Keep resume data aligned with authenticated edits. Once a provider request
      // starts, its amount stays frozen even when the order total is adjusted.
      if (process.env.ENABLE_SECURE_CHECKOUT === "true") await tx.update(secureCheckoutSessions).set({
        cart: order.cartSnapshot.filter(item => !item.isGift).map(item => ({ ...item, image: item.image || "", inspiration: item.inspiration || "", category: "Perfume" })),
        details: Object.fromEntries(["fullName", "phone", "alternatePhone", "email", "addressLine1", "addressLine2", "city", "state", "pincode", "notes"].map(key => [key, String(order[key as keyof typeof order] || "")])),
        ...((financialChange || input.paymentMethod !== undefined) && order.checkoutChannel === "razorpay" && !order.razorpayOrderId && !order.paymentCapturedAt && order.paymentSyncStatus !== "creating" ? { expectedPaymentMinor: expectedPaymentMinor(Number(order.grandTotal), /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || "")) } : {}),
        updatedAt: new Date(),
      }).where(eq(secureCheckoutSessions.orderId, id));
      await tx.insert(orderEditAudits).values({ id: `order-audit-${randomUUID()}`, orderId: id, changeType: financialChange ? "financial_and_operational" : "operational", reason: input.editReason || input.adjustmentReason || null, actor: "admin", beforeSnapshot: current, afterSnapshot: order });
      return order;
    });
    const capturedAmount = await getCapturedAmount(id);
    return NextResponse.json({ ok: true, order: updated, reconciliation: { capturedAmount, revisedTotal: grandTotal, difference: grandTotal - capturedAmount } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || "Invalid order details" }, { status: 400 });
    console.error("Failed to update order:", error); return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(req); if (unauthorized) return unauthorized;
  try { const { id } = await params; await db.delete(orders).where(eq(orders.id, id)); return NextResponse.json({ ok: true }); }
  catch (error) { console.error("Failed to delete order:", error); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
