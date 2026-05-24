import { NextRequest, NextResponse } from "next/server";
import { desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accountToken } = accountRequestSchema.parse(body);
    const accountSession = accountToken ? await findAccountSession(accountToken) : null;
    const identity = accountSession ? identityFromSession(accountSession) : null;

    if (!sessionId && !identity) {
      return NextResponse.json(
        { ok: false, error: "Account session not found" },
        { status: 401 },
      );
    }

    const draftWhere = identity && sessionId
      ? or(eq(checkoutDrafts.sessionId, sessionId), accountDraftWhere(identity))
      : identity
        ? accountDraftWhere(identity)
        : eq(checkoutDrafts.sessionId, sessionId as string);

    const orderWhere = identity && sessionId
      ? or(eq(orders.sessionId, sessionId), accountOrderWhere(identity))
      : identity
        ? accountOrderWhere(identity)
        : eq(orders.sessionId, sessionId as string);

    const [latestDraft, accountOrders] = await Promise.all([
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
    ]);

    const newestOrder = accountOrders[0];
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
        appliedCouponCode: order.appliedCouponCode,
        cartSnapshot: order.cartSnapshot,
        giftItems: order.giftItems,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        shippedAt: order.shippedAt?.toISOString() ?? null,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    console.error("account lookup error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to load account details" },
      { status: 500 },
    );
  }
}
