import { NextRequest, NextResponse } from "next/server";
import { and, desc, gte } from "drizzle-orm";
import { db } from "@/db";
import { cartEvents } from "@/db/schema";

type EventRow = {
  id: string;
  createdAt: Date;
  path: string | null;
  eventType: string;
  productId: string | null;
  productName: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(
      24 * 30,
      Math.max(1, Number(searchParams.get("hours") || "24"))
    );
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const rows = (await db
      .select({
        id: cartEvents.id,
        createdAt: cartEvents.createdAt,
        path: cartEvents.path,
        eventType: cartEvents.eventType,
        productId: cartEvents.productId,
        productName: cartEvents.productName,
      })
      .from(cartEvents)
      .where(and(gte(cartEvents.createdAt, since)))
      .orderBy(desc(cartEvents.createdAt))
      .limit(5000)) as EventRow[];

    const tracked = rows.filter((row) =>
      ["add_to_cart", "update_cart_quantity", "remove_from_cart", "cart_open"].includes(
        row.eventType
      )
    );

    const byEvent = tracked.reduce<Record<string, number>>((acc, row) => {
      acc[row.eventType] = (acc[row.eventType] || 0) + 1;
      return acc;
    }, {});

    const topProductsMap = new Map<string, { name: string; count: number }>();
    tracked
      .filter((row) => row.eventType === "add_to_cart")
      .forEach((row) => {
        const productId = String(row.productId || "");
        const productName = String(row.productName || productId || "Unknown");
        if (!productId) return;
        const existing = topProductsMap.get(productId);
        if (existing) {
          existing.count += 1;
          return;
        }
        topProductsMap.set(productId, { name: productName, count: 1 });
      });

    const topProducts = Array.from(topProductsMap.entries())
      .map(([id, entry]) => ({ id, name: entry.name, count: entry.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      windowHours: hours,
      totals: {
        pageViews: byEvent.page_view || 0,
        cartOpenClicks: byEvent.cart_open || 0,
        addToCart: byEvent.add_to_cart || 0,
        quantityUpdates: byEvent.update_cart_quantity || 0,
        removeFromCart: byEvent.remove_from_cart || 0,
      },
      topProducts,
      eventsCount: tracked.length,
    });
  } catch (error) {
    console.error("cart-funnel analytics error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load analytics" }, { status: 500 });
  }
}
