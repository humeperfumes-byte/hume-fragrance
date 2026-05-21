import { Metadata } from "next";
import type { ComponentProps } from "react";
import { desc, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import TrackingSystemClient from "./TrackingSystemClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipment Tracking | HUME Admin",
};

export default async function TrackingPage() {
  let trackedOrders: ComponentProps<typeof TrackingSystemClient>["initialTrackedOrders"] = [];

  try {
    const rows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        checkoutChannel: orders.checkoutChannel,
        fullName: orders.fullName,
        phone: orders.phone,
        city: orders.city,
        state: orders.state,
        fulfillmentCarrier: orders.fulfillmentCarrier,
        trackingNumber: orders.trackingNumber,
        trackingUrl: orders.trackingUrl,
        trackingStatus: orders.trackingStatus,
        trackingLastCheckedAt: orders.trackingLastCheckedAt,
        shippedAt: orders.shippedAt,
        deliveredAt: orders.deliveredAt,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        sessionId: orders.sessionId,
        path: orders.path,
        userAgent: orders.userAgent,
        ipAddress: orders.ipAddress,
      })
      .from(orders)
      .where(isNotNull(orders.trackingNumber))
      .orderBy(desc(orders.updatedAt))
      .limit(200);

    trackedOrders = filterExcludedAdminRows(rows, collectExcludedSessionIds(rows))
      .filter((order) => order.trackingNumber?.trim())
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        checkoutChannel: order.checkoutChannel,
        fullName: order.fullName,
        phone: order.phone,
        city: order.city,
        state: order.state,
        fulfillmentCarrier: order.fulfillmentCarrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        trackingStatus: order.trackingStatus,
        trackingLastCheckedAt: order.trackingLastCheckedAt?.toISOString() ?? null,
        shippedAt: order.shippedAt?.toISOString() ?? null,
        deliveredAt: order.deliveredAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      }));
  } catch (error) {
    console.error("Failed to load tracked shipments:", error);
  }

  return <TrackingSystemClient initialTrackedOrders={trackedOrders} />;
}
