import { NextRequest, NextResponse } from "next/server";
import { desc, gte } from "drizzle-orm";
import { db } from "@/db";
import { cartEvents, checkoutDrafts, consentEvents, orders } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  isIndiaCheckoutSignal,
  isIndiaMarket,
  isIndiaOperationalCountry,
  isIndiaTimezone,
  parseAdminMarket,
} from "@/lib/admin-market";

type TimelineRow = {
  sessionId: string;
  path: string | null;
  createdAt: Date;
  timezone: string | null;
  data: Record<string, unknown>;
};

type CartRow = {
  sessionId: string;
  eventType: string;
  productId: string | null;
  productName: string | null;
  country: string | null;
  createdAt: Date;
};

type DraftRow = {
  id: string;
  sessionId: string;
  status: string;
  acquisitionSource: string | null;
  acquisitionCategory: string | null;
  phone: string | null;
  email: string | null;
  fullName: string | null;
  grandTotal: string | null;
  country: string | null;
  pincode: string | null;
  state: string | null;
  cartSnapshot: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    isGift?: boolean;
  }>;
  updatedAt: Date;
  whatsappInitiatedAt: Date | null;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  sessionId: string;
  status: string;
  acquisitionSource: string | null;
  acquisitionCategory: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  grandTotal: string | null;
  country: string | null;
  pincode: string | null;
  state: string | null;
  cartSnapshot: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    isGift?: boolean;
  }>;
  createdAt: Date;
};

function money(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0") || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function getCustomerKey(row: { phone: string | null; email: string | null }): string | null {
  const phone = row.phone?.replace(/\D/g, "");
  if (phone && phone.length >= 8) return `phone:${phone}`;
  const email = row.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  return null;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(24 * 90, Math.max(1, Number(searchParams.get("hours") || "720")));
    const market = parseAdminMarket(searchParams.get("market"));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [timelineRows, cartRows, draftRows, orderRows] = await Promise.all([
      db
        .select({
          sessionId: consentEvents.sessionId,
          path: consentEvents.path,
          createdAt: consentEvents.createdAt,
          timezone: consentEvents.timezone,
          data: consentEvents.data,
        })
        .from(consentEvents)
        .where(gte(consentEvents.createdAt, since))
        .orderBy(desc(consentEvents.createdAt))
        .limit(10000) as Promise<TimelineRow[]>,
      db
        .select({
          sessionId: cartEvents.sessionId,
          eventType: cartEvents.eventType,
          productId: cartEvents.productId,
          productName: cartEvents.productName,
          country: cartEvents.country,
          createdAt: cartEvents.createdAt,
        })
        .from(cartEvents)
        .where(gte(cartEvents.createdAt, since))
        .orderBy(desc(cartEvents.createdAt))
        .limit(10000) as Promise<CartRow[]>,
      db
        .select({
          id: checkoutDrafts.id,
          sessionId: checkoutDrafts.sessionId,
          status: checkoutDrafts.status,
          acquisitionSource: checkoutDrafts.acquisitionSource,
          acquisitionCategory: checkoutDrafts.acquisitionCategory,
          phone: checkoutDrafts.phone,
          email: checkoutDrafts.email,
          fullName: checkoutDrafts.fullName,
          grandTotal: checkoutDrafts.grandTotal,
          country: checkoutDrafts.country,
          pincode: checkoutDrafts.pincode,
          state: checkoutDrafts.state,
          cartSnapshot: checkoutDrafts.cartSnapshot,
          updatedAt: checkoutDrafts.updatedAt,
          whatsappInitiatedAt: checkoutDrafts.whatsappInitiatedAt,
        })
        .from(checkoutDrafts)
        .where(gte(checkoutDrafts.updatedAt, since))
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(5000) as Promise<DraftRow[]>,
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          sessionId: orders.sessionId,
          status: orders.status,
          acquisitionSource: orders.acquisitionSource,
          acquisitionCategory: orders.acquisitionCategory,
          fullName: orders.fullName,
          phone: orders.phone,
          email: orders.email,
          grandTotal: orders.grandTotal,
          country: orders.country,
          pincode: orders.pincode,
          state: orders.state,
          cartSnapshot: orders.cartSnapshot,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(gte(orders.createdAt, since))
        .orderBy(desc(orders.createdAt))
        .limit(5000) as Promise<OrderRow[]>,
    ]);

    const indiaOnly = isIndiaMarket(market);
    const scopedTimelineRows = indiaOnly
      ? timelineRows.filter((row) => isIndiaTimezone(row.timezone) || isIndiaOperationalCountry(String(row.data?.country ?? "")))
      : timelineRows;
    const scopedCartRows = indiaOnly ? cartRows.filter((row) => isIndiaOperationalCountry(row.country)) : cartRows;
    const scopedDraftRows = indiaOnly ? draftRows.filter(isIndiaCheckoutSignal) : draftRows;
    const scopedOrderRows = indiaOnly ? orderRows.filter(isIndiaCheckoutSignal) : orderRows;

    const pageViews = scopedTimelineRows.filter((row) => row.data?.eventType === "page_view");
    const uniqueViewerSessions = new Set(pageViews.map((row) => row.sessionId));
    const sourceSessionMap = new Map<
      string,
      {
        source: string;
        category: string;
        count: number;
      }
    >();

    pageViews.forEach((row) => {
      const source = String(row.data?.source || "Direct").trim() || "Direct";
      const category = String(row.data?.sourceCategory || "other").trim() || "other";
      const key = `${source}::${category}`;
      const existing = sourceSessionMap.get(key);
      if (existing) {
        existing.count += 1;
        return;
      }
      sourceSessionMap.set(key, { source, category, count: 1 });
    });

    const sourceBreakdown = Array.from(sourceSessionMap.values()).sort((a, b) => b.count - a.count);
    const keySources = ["Google", "Instagram", "ChatGPT", "Perplexity", "Claude", "Gemini"];
    const highlightedSources = keySources
      .map((label) => sourceBreakdown.find((entry) => entry.source === label))
      .filter(Boolean);

    const productClickRows = scopedTimelineRows.filter((row) => row.data?.eventType === "product_click");
    const productClickMap = new Map<string, { name: string; clicks: number; lastClickedAt: Date }>();

    productClickRows.forEach((row) => {
      const productId = String(row.data?.productId || "").trim();
      const productName = String(row.data?.productName || productId || "Unknown Product").trim();
      if (!productId) return;

      const existing = productClickMap.get(productId);
      if (existing) {
        existing.clicks += 1;
        if (row.createdAt > existing.lastClickedAt) {
          existing.lastClickedAt = row.createdAt;
        }
        return;
      }

      productClickMap.set(productId, {
        name: productName,
        clicks: 1,
        lastClickedAt: row.createdAt,
      });
    });

    const productAddMap = new Map<string, { name: string; addToCart: number; lastAddedAt: Date }>();
    scopedCartRows
      .filter((row) => row.eventType === "add_to_cart")
      .forEach((row) => {
        const productId = String(row.productId || "").trim();
        const productName = String(row.productName || productId || "Unknown Product").trim();
        if (!productId) return;

        const existing = productAddMap.get(productId);
        if (existing) {
          existing.addToCart += 1;
          if (row.createdAt > existing.lastAddedAt) {
            existing.lastAddedAt = row.createdAt;
          }
          return;
        }

        productAddMap.set(productId, {
          name: productName,
          addToCart: 1,
          lastAddedAt: row.createdAt,
        });
      });

    const productPerformance = Array.from(
      new Set([...productClickMap.keys(), ...productAddMap.keys()]),
    )
      .map((productId) => {
        const clickEntry = productClickMap.get(productId);
        const addEntry = productAddMap.get(productId);
        return {
          productId,
          name: clickEntry?.name || addEntry?.name || "Unknown Product",
          clicks: clickEntry?.clicks || 0,
          addToCart: addEntry?.addToCart || 0,
          lastInteractionAt:
            clickEntry?.lastClickedAt && addEntry?.lastAddedAt
              ? new Date(
                  Math.max(clickEntry.lastClickedAt.getTime(), addEntry.lastAddedAt.getTime()),
                ).toISOString()
              : (clickEntry?.lastClickedAt || addEntry?.lastAddedAt || new Date(0)).toISOString(),
        };
      })
      .filter((product) => product.clicks > 0 || product.addToCart > 0)
      .sort((a, b) => {
        if (b.clicks !== a.clicks) return b.clicks - a.clicks;
        return b.addToCart - a.addToCart;
      })
      .slice(0, 20);

    const uniqueCartOpenSessions = new Set(
      scopedCartRows.filter((row) => row.eventType === "cart_open").map((row) => row.sessionId),
    );

    const totalCartOpens = scopedCartRows.filter((row) => row.eventType === "cart_open").length;
    const totalAddToCart = scopedCartRows.filter((row) => row.eventType === "add_to_cart").length;
    const totalQuantityUpdates = scopedCartRows.filter(
      (row) => row.eventType === "update_cart_quantity",
    ).length;
    const totalRemoveFromCart = scopedCartRows.filter(
      (row) => row.eventType === "remove_from_cart",
    ).length;

    const completedOrders = scopedOrderRows.filter((row) => row.status !== "cancelled");
    const deliveredOrders = scopedOrderRows.filter((row) => row.status === "delivered");
    const openOrders = scopedOrderRows.filter((row) =>
      ["whatsapp_initiated", "processing", "shipped"].includes(row.status),
    );
    const cancelledOrders = scopedOrderRows.filter((row) => row.status === "cancelled");
    const revenue = completedOrders.reduce((sum, row) => sum + money(row.grandTotal), 0);
    const deliveredRevenue = deliveredOrders.reduce((sum, row) => sum + money(row.grandTotal), 0);
    const averageOrderValue = completedOrders.length ? revenue / completedOrders.length : 0;

    const activeDrafts = scopedDraftRows.filter((row) => row.status !== "started");
    const whatsappInitiatedDrafts = scopedDraftRows.filter(
      (row) => row.status === "whatsapp_initiated" || row.whatsappInitiatedAt,
    );
    const recoverableDrafts = activeDrafts.filter(
      (row) => row.status !== "whatsapp_initiated" && (row.phone || row.email || row.fullName),
    );
    const draftValue = activeDrafts.reduce(
      (sum, row) => sum + money(row.grandTotal),
      0,
    );
    const recoverableDraftValue = recoverableDrafts.reduce(
      (sum, row) => sum + money(row.grandTotal),
      0,
    );

    const topPaths = pageViews
      .reduce<Map<string, number>>((acc, row) => {
        const key = row.path || "/";
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map())
      .entries();

    const topViewedPages = Array.from(topPaths)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const sourceMap = new Map<
      string,
      {
        source: string;
        category: string;
        visits: number;
        addToCart: number;
        drafts: number;
        draftValue: number;
        orders: number;
        revenue: number;
      }
    >();

    sourceBreakdown.forEach((entry) => {
      sourceMap.set(`${entry.source}::${entry.category}`, {
        source: entry.source,
        category: entry.category,
        visits: entry.count,
        addToCart: 0,
        drafts: 0,
        draftValue: 0,
        orders: 0,
        revenue: 0,
      });
    });

    function getSourceEntry(source: string | null, category: string | null) {
      const normalizedSource = source?.trim() || "Unknown";
      const normalizedCategory = category?.trim() || "unknown";
      const key = `${normalizedSource}::${normalizedCategory}`;
      const existing = sourceMap.get(key);
      if (existing) return existing;
      const next = {
        source: normalizedSource,
        category: normalizedCategory,
        visits: 0,
        addToCart: 0,
        drafts: 0,
        draftValue: 0,
        orders: 0,
        revenue: 0,
      };
      sourceMap.set(key, next);
      return next;
    }

    const sourceBySession = new Map<string, { source: string; category: string }>();
    pageViews.forEach((row) => {
      if (sourceBySession.has(row.sessionId)) return;
      sourceBySession.set(row.sessionId, {
        source: String(row.data?.source || "Direct").trim() || "Direct",
        category: String(row.data?.sourceCategory || "other").trim() || "other",
      });
    });

    scopedCartRows
      .filter((row) => row.eventType === "add_to_cart")
      .forEach((row) => {
        const source = sourceBySession.get(row.sessionId);
        getSourceEntry(source?.source ?? "Unknown", source?.category ?? "unknown").addToCart += 1;
      });

    activeDrafts.forEach((row) => {
      const source = sourceBySession.get(row.sessionId);
      const entry = getSourceEntry(
        row.acquisitionSource || source?.source || "Unknown",
        row.acquisitionCategory || source?.category || "unknown",
      );
      entry.drafts += 1;
      entry.draftValue += money(row.grandTotal);
    });

    completedOrders.forEach((row) => {
      const source = sourceBySession.get(row.sessionId);
      const entry = getSourceEntry(
        row.acquisitionSource || source?.source || "Unknown",
        row.acquisitionCategory || source?.category || "unknown",
      );
      entry.orders += 1;
      entry.revenue += money(row.grandTotal);
    });

    const sourceRoi = Array.from(sourceMap.values())
      .map((entry) => ({
        ...entry,
        visitToOrderRate: percent(entry.orders, entry.visits),
        revenuePerVisit: entry.visits > 0 ? Math.round(entry.revenue / entry.visits) : 0,
      }))
      .filter((entry) => entry.visits > 0 || entry.drafts > 0 || entry.orders > 0)
      .sort((a, b) => b.revenue - a.revenue || b.draftValue - a.draftValue || b.visits - a.visits)
      .slice(0, 12);

    const productDemandMap = new Map<
      string,
      {
        productId: string;
        name: string;
        addToCart: number;
        orderedUnits: number;
        orderRevenue: number;
        draftUnits: number;
        draftValue: number;
      }
    >();

    function getProductDemand(productId: string, name: string) {
      const existing = productDemandMap.get(productId);
      if (existing) return existing;
      const next = {
        productId,
        name,
        addToCart: 0,
        orderedUnits: 0,
        orderRevenue: 0,
        draftUnits: 0,
        draftValue: 0,
      };
      productDemandMap.set(productId, next);
      return next;
    }

    productAddMap.forEach((entry, productId) => {
      getProductDemand(productId, entry.name).addToCart = entry.addToCart;
    });

    completedOrders.forEach((order) => {
      order.cartSnapshot?.forEach((item) => {
        if (item.isGift) return;
        const demand = getProductDemand(item.id, item.name);
        demand.orderedUnits += item.quantity;
        demand.orderRevenue += item.price * item.quantity;
      });
    });

    activeDrafts.forEach((draft) => {
      draft.cartSnapshot?.forEach((item) => {
        if (item.isGift) return;
        const demand = getProductDemand(item.id, item.name);
        demand.draftUnits += item.quantity;
        demand.draftValue += item.price * item.quantity;
      });
    });

    const productDemand = Array.from(productDemandMap.values())
      .map((entry) => ({
        ...entry,
        demandScore: entry.orderedUnits * 5 + entry.draftUnits * 2 + entry.addToCart,
      }))
      .sort((a, b) => b.demandScore - a.demandScore || b.orderRevenue - a.orderRevenue)
      .slice(0, 15);

    const customerMap = new Map<
      string,
      {
        name: string;
        phone: string | null;
        email: string | null;
        orders: number;
        revenue: number;
        lastOrderAt: Date;
      }
    >();

    completedOrders.forEach((order) => {
      const key = getCustomerKey(order);
      if (!key) return;
      const existing = customerMap.get(key);
      if (existing) {
        existing.orders += 1;
        existing.revenue += money(order.grandTotal);
        if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
        return;
      }
      customerMap.set(key, {
        name: order.fullName || "Unknown customer",
        phone: order.phone,
        email: order.email,
        orders: 1,
        revenue: money(order.grandTotal),
        lastOrderAt: order.createdAt,
      });
    });

    const repeatCustomers = Array.from(customerMap.values())
      .filter((customer) => customer.orders > 1)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((customer) => ({
        ...customer,
        lastOrderAt: customer.lastOrderAt.toISOString(),
      }));

    const recentOrders = scopedOrderRows.slice(0, 8).map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      fullName: order.fullName,
      phone: order.phone,
      grandTotal: money(order.grandTotal),
      createdAt: order.createdAt.toISOString(),
    }));

    const conversionFunnel = {
      visitors: uniqueViewerSessions.size,
      cartVisitors: uniqueCartOpenSessions.size,
      addToCart: totalAddToCart,
      checkoutDrafts: activeDrafts.length,
      whatsappInitiated: whatsappInitiatedDrafts.length,
      orders: completedOrders.length,
      visitorToCartRate: percent(uniqueCartOpenSessions.size, uniqueViewerSessions.size),
      cartToDraftRate: percent(activeDrafts.length, uniqueCartOpenSessions.size),
      draftToOrderRate: percent(completedOrders.length, activeDrafts.length),
      visitorToOrderRate: percent(completedOrders.length, uniqueViewerSessions.size),
    };

    return NextResponse.json({
      ok: true,
      windowHours: hours,
      market,
      overview: {
        uniqueViewers: uniqueViewerSessions.size,
        uniqueCartVisitors: uniqueCartOpenSessions.size,
        totalPageViews: pageViews.length,
        totalCartOpens,
        totalAddToCart,
        totalQuantityUpdates,
        totalRemoveFromCart,
        activeDrafts: activeDrafts.length,
        recoverableDrafts: recoverableDrafts.length,
        whatsappInitiatedDrafts: whatsappInitiatedDrafts.length,
        abandonedDraftValue: draftValue,
        recoverableDraftValue,
        orders: completedOrders.length,
        openOrders: openOrders.length,
        deliveredOrders: deliveredOrders.length,
        cancelledOrders: cancelledOrders.length,
        revenue,
        deliveredRevenue,
        averageOrderValue,
      },
      conversionFunnel,
      sourceRoi,
      productDemand,
      repeatCustomers,
      recentOrders,
      sourceBreakdown,
      highlightedSources,
      productPerformance,
      topViewedPages,
    });
  } catch (error) {
    console.error("admin dashboard analytics error:", error);
    return NextResponse.json({ error: "Failed to load admin dashboard analytics" }, { status: 500 });
  }
}
