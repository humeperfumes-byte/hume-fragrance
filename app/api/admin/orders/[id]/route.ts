import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coupons, orderEditAudits, orders, products, razorpayWebhookEvents } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { calculateCouponDiscount } from "@/lib/cart-discounts";
import { displayPhoneNumber } from "@/lib/phone";

const itemSchema = z.object({
  id: z.string().min(1), name: z.string().min(1), image: z.string().optional(), inspiration: z.string().optional(), size: z.string().optional(),
  quantity: z.coerce.number().int().min(1).max(100), price: z.coerce.number().nonnegative(), isGift: z.boolean().optional(),
  kitSelections: z.array(z.object({ id: z.string(), name: z.string(), inspiration: z.string().optional() })).optional(),
  sampleSelections: z.array(z.object({ id: z.string(), name: z.string(), inspiration: z.string().optional() })).optional(),
});

const patchSchema = z.object({
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
    const [current] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const financialChange = (input.cartSnapshot !== undefined && JSON.stringify(input.cartSnapshot) !== JSON.stringify(current.cartSnapshot))
      || (input.appliedCouponCode !== undefined && input.appliedCouponCode.trim().toUpperCase() !== (current.appliedCouponCode || "").trim().toUpperCase())
      || (input.shippingFee !== undefined && money(input.shippingFee) !== money(current.shippingFee))
      || (input.manualAdjustment !== undefined && money(input.manualAdjustment) !== money(current.manualAdjustment));
    if (financialChange && paidStatuses.has(current.status) && !input.editReason?.trim()) return NextResponse.json({ error: "A reason is required when changing a paid order" }, { status: 400 });

    const nextItems = input.cartSnapshot ?? current.cartSnapshot;
    const ids = [...new Set(nextItems.filter((item) => !item.isGift && !item.kitSelections?.length && !item.sampleSelections?.length).map((item) => item.id))];
    const catalogue = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : [];
    const productMap = new Map(catalogue.map((product) => [product.id, product]));
    const currentIds = new Set(current.cartSnapshot.map((item) => item.id));
    const repricedItems = financialChange ? nextItems.map((item) => {
      if (item.isGift || item.kitSelections?.length || item.sampleSelections?.length) return item;
      const product = productMap.get(item.id);
      if (!product) { if (currentIds.has(item.id)) return item; throw new Error(`Product ${item.name} is no longer available`); }
      if ((product.badges?.soldOut || product.badges?.comingSoon) && !currentIds.has(item.id)) throw new Error(`${product.name} is unavailable`);
      return { ...item, name: product.name, inspiration: product.inspiration, size: product.size, image: product.images?.[0], price: money(product.price) };
    }) : current.cartSnapshot;
    const subtotal = financialChange ? repricedItems.filter((item) => !item.isGift).reduce((sum, item) => sum + money(item.price) * item.quantity, 0) : money(current.subtotal);
    const couponCode = (input.appliedCouponCode ?? current.appliedCouponCode ?? "").split(",")[0].trim().toUpperCase();
    let couponDiscount = 0;
    if (financialChange && couponCode) {
      const [coupon] = await db.select().from(coupons).where(and(eq(coupons.code, couponCode), eq(coupons.active, true), sql`${coupons.archivedAt} is null`)).limit(1);
      if (!coupon) return NextResponse.json({ error: `Coupon ${couponCode} is invalid or archived` }, { status: 400 });
      couponDiscount = calculateCouponDiscount({ ...coupon, value: money(coupon.value), minSubtotal: money(coupon.minSubtotal) }, repricedItems, subtotal).discount;
    }
    const shippingFee = input.shippingFee ?? money(current.shippingFee); const manualAdjustment = input.manualAdjustment ?? money(current.manualAdjustment);
    if (financialChange && manualAdjustment !== 0 && !(input.adjustmentReason ?? current.adjustmentReason)?.trim()) return NextResponse.json({ error: "Manual adjustments require a reason" }, { status: 400 });
    const grandTotal = financialChange ? Math.max(0, subtotal - Math.min(subtotal, couponDiscount) + shippingFee + manualAdjustment) : money(current.grandTotal);
    const patch = {
      ...input, cartSnapshot: financialChange ? repricedItems : undefined, appliedCouponCode: financialChange ? couponCode || null : undefined, subtotal: financialChange ? subtotal.toFixed(2) : undefined, shippingFee: financialChange ? shippingFee.toFixed(2) : undefined, manualAdjustment: financialChange ? manualAdjustment.toFixed(2) : undefined, grandTotal: financialChange ? grandTotal.toFixed(2) : undefined, updatedAt: new Date(),
      phone: input.phone === undefined ? undefined : (displayPhoneNumber(input.phone) || null), alternatePhone: input.alternatePhone === undefined ? undefined : (displayPhoneNumber(input.alternatePhone) || null), email: input.email === undefined ? undefined : (input.email || null),
      editReason: undefined, shippedAt: input.shippedAt ? new Date(input.shippedAt) : undefined, deliveredAt: input.deliveredAt ? new Date(input.deliveredAt) : undefined, trackingLastCheckedAt: input.trackingLastCheckedAt ? new Date(input.trackingLastCheckedAt) : undefined,
    };
    const updated = await db.transaction(async (tx) => {
      const [order] = await tx.update(orders).set(patch).where(and(eq(orders.id, id), eq(orders.updatedAt, current.updatedAt))).returning();
      if (!order) throw new Error("This order changed in another session. Refresh and try again.");
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
