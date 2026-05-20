import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";

const accountRequestSchema = z.object({
  sessionId: z.string().min(8).max(255),
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
  if (!order.trackingNumber) return null;
  return order.trackingUrl || `/track-order/${encodeURIComponent(order.trackingNumber)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = accountRequestSchema.parse(body);

    const [latestDraft, accountOrders] = await Promise.all([
      db
        .select()
        .from(checkoutDrafts)
        .where(eq(checkoutDrafts.sessionId, sessionId))
        .limit(1),
      db
        .select()
        .from(orders)
        .where(eq(orders.sessionId, sessionId))
        .orderBy(desc(orders.createdAt))
        .limit(50),
    ]);

    const newestOrder = accountOrders[0];
    const profileSource = newestOrder || latestDraft[0] || null;

    return NextResponse.json({
      ok: true,
      profile: profileSource
        ? {
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
