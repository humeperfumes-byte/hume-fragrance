import { secureCheckoutConfigured } from "@/lib/checkout-settings";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq, or, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { checkoutDrafts, orders, products, secureCheckoutSessions } from "@/db/schema";
import { CHECKOUT_OWNER_COOKIE, ownsCheckout } from "@/lib/secure-checkout-capability";
import { hashCustomerToken } from "@/lib/customer-access-token";
import {
  accountDraftWhere,
  accountOrderWhere,
  findAccountSession,
  identityFromSession,
} from "@/lib/account-login";
import { buildPublicTrackingPath } from "@/lib/tracking-url";

const accountRequestSchema = z.object({
  sessionId: z.string().min(4).max(255).optional(),
  accountToken: z.string().min(16).max(512).optional(),
});

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getTrackingHref(order: {
  trackingNumber: string | null;
  trackingUrl: string | null;
}) {
  return buildPublicTrackingPath(order.trackingNumber) || order.trackingUrl || null;
}

function productNameKey(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accountToken } = accountRequestSchema.parse(body);
    const accountSession = accountToken ? await findAccountSession(accountToken) : null;
    const identity = accountSession ? identityFromSession(accountSession) : null;
    const owner = request.cookies.get(CHECKOUT_OWNER_COOKIE)?.value;
    const ownerHash = owner ? hashCustomerToken(owner) : null;
    const secureEnabled = secureCheckoutConfigured();
    const ownedSessions = secureEnabled && ownerHash ? await db.select({ id: secureCheckoutSessions.id }).from(secureCheckoutSessions).where(eq(secureCheckoutSessions.ownerHash, ownerHash)) : [];
    const sessionIds = ownedSessions.map(session => session.id);
    if (sessionId) {
      const [secure] = secureEnabled ? await db.select({ ownerHash: secureCheckoutSessions.ownerHash }).from(secureCheckoutSessions).where(eq(secureCheckoutSessions.id, sessionId)).limit(1) : [];
      if (secure ? ownsCheckout(owner, secure.ownerHash) : secureEnabled || !/^[a-f0-9-]{36}$/i.test(sessionId)) sessionIds.push(sessionId);
    }

    if (!sessionIds.length && !identity) {
      return NextResponse.json(
        { ok: false, error: "Account session not found" },
        { status: 401 },
      );
    }

    const draftWhere = identity && sessionIds.length
      ? or(inArray(checkoutDrafts.sessionId, sessionIds), accountDraftWhere(identity))
      : identity
        ? accountDraftWhere(identity)
        : inArray(checkoutDrafts.sessionId, sessionIds);

    const orderWhere = identity && sessionIds.length
      ? or(inArray(orders.sessionId, sessionIds), accountOrderWhere(identity))
      : identity
        ? accountOrderWhere(identity)
        : inArray(orders.sessionId, sessionIds);

    const [latestDraft, accountOrders, productImages] = await Promise.all([
      db
        .select()
        .from(checkoutDrafts)
        .where(draftWhere)
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(1),
      db
        .select()
        .from(orders)
        .where(orderWhere)
        .orderBy(desc(orders.createdAt))
        .limit(50),
      db
        .select({ id: products.id, name: products.name, images: products.images })
        .from(products),
    ]);

    const imageById = new Map(productImages.map((product) => [product.id, product.images[0]]));
    const imageByName = new Map(productImages.map((product) => [productNameKey(product.name), product.images[0]]));

    const newestOrder = accountOrders[0];
    const secureOrderIds = secureEnabled && accountOrders.length ? await db.select({ orderId: secureCheckoutSessions.orderId }).from(secureCheckoutSessions).where(inArray(secureCheckoutSessions.orderId, accountOrders.map(order => order.id))) : [];
    const secureIds = new Set(secureOrderIds.map(session => session.orderId));
    const profileSource = newestOrder || latestDraft[0] || null;

    return NextResponse.json({
      ok: true,
      profile: profileSource
        ? {
            sessionId: profileSource.sessionId,
            fullName: profileSource.fullName,
            phone: profileSource.phone,
            email: profileSource.email,
            addressLine1: profileSource.addressLine1,
            addressLine2: profileSource.addressLine2,
            city: profileSource.city,
            state: profileSource.state,
            pincode: profileSource.pincode,
            notes: profileSource.notes,
          }
        : null,
      orders: accountOrders.map((order) => ({
        id: order.id,
        secureCheckout: secureIds.has(order.id),
        orderNumber: order.orderNumber,
        status: order.status,
        checkoutChannel: order.checkoutChannel,
        paymentMethod: order.paymentMethod,
        shippingMethod: order.shippingMethod,
        fulfillmentCarrier: order.fulfillmentCarrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: getTrackingHref(order),
        trackingStatus: order.trackingStatus,
        trackingLastCheckedAt: order.trackingLastCheckedAt?.toISOString() ?? null,
        subtotal: toNumber(order.subtotal),
        shippingFee: toNumber(order.shippingFee),
        grandTotal: toNumber(order.grandTotal),
        codFee: toNumber(order.codFee),
        appliedCouponCode: order.appliedCouponCode,
        cartSnapshot: order.cartSnapshot.map((item) => ({
          ...item,
          image:
            item.image ||
            imageById.get(item.id) ||
            imageByName.get(productNameKey(item.name)) ||
            "/images/logo.png",
        })),
        giftItems: order.giftItems,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippedAt: order.shippedAt?.toISOString() ?? null,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
      })),
    }, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    console.error("account lookup error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to load account details" },
      { status: 500 },
    );
  }
}
