import "server-only";

import { createHash } from "node:crypto";
import { and, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import {
  behavioralEvents,
  cartEvents,
  checkoutDrafts,
  couponCodeEvents,
  customerFeedback,
  flyerCampaignEvents,
  orders,
  products,
  reviews,
  stockNotifyRequests,
} from "@/db/schema";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  isGift?: boolean;
};

type SafeOrder = {
  sessionId: string;
  status: string;
  paymentMethod: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  grandTotal: string | null;
  state: string | null;
  cartSnapshot: CartItem[];
  createdAt: Date;
  phone: string | null;
  email: string | null;
  ipAddress: string | null;
  userAgent: string | null;
};

function money(value: unknown) {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isPartialCodOrder(order: SafeOrder) {
  return Boolean(order.paymentMethod?.includes("Prepaid") && order.paymentMethod.includes("Cash on Delivery"));
}

function isRevenueQualifiedOrder(order: SafeOrder) {
  if (["cancelled", "payment_pending", "payment_failed", "refunded", "partially_refunded"].includes(order.status)) {
    return false;
  }
  return Boolean(
    order.trackingNumber ||
      order.shippedAt ||
      order.deliveredAt ||
      ["shipped", "delivered", "complete"].includes(order.status) ||
      (order.status === "processing" && order.paymentMethod),
  );
}

function recognizedRevenue(order: SafeOrder) {
  const total = money(order.grandTotal);
  if (!isPartialCodOrder(order)) return total;
  if (order.deliveredAt || ["delivered", "complete", "shipped"].includes(order.status) || order.trackingNumber || order.shippedAt) {
    return total;
  }
  const parsed = Number(order.paymentMethod?.match(/(\d+)%\s*Prepaid/i)?.[1] ?? 20);
  return Math.round(total * ((Number.isFinite(parsed) ? parsed : 20) / 100));
}

function orderUnits(order: SafeOrder) {
  return order.cartSnapshot.reduce(
    (sum, item) => sum + (item.isGift ? 0 : Math.max(0, Number(item.quantity || 0))),
    0,
  );
}

function percentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function increment(map: Map<string, number>, key: string, by = 1) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + by);
}

function topEntries(map: Map<string, number>, limit = 8) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function safeRate(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : 0;
}

function summarizeOrders(rows: SafeOrder[]) {
  const qualified = rows.filter(isRevenueQualifiedOrder);
  const revenue = qualified.reduce((sum, row) => sum + recognizedRevenue(row), 0);
  const units = qualified.reduce((sum, row) => sum + orderUnits(row), 0);
  const statusMix = new Map<string, number>();
  const paymentMix = new Map<string, number>();
  rows.forEach((row) => {
    increment(statusMix, row.status || "unknown");
    increment(paymentMix, row.paymentMethod || "not recorded");
  });
  return {
    qualifiedOrders: qualified.length,
    totalOrderRecords: rows.length,
    revenue,
    units,
    averageOrderValue: qualified.length ? Math.round(revenue / qualified.length) : 0,
    statusMix: topEntries(statusMix, 12),
    paymentMix: topEntries(paymentMix, 8),
  };
}

function customerKey(row: Pick<SafeOrder, "phone" | "email">) {
  const phone = row.phone?.replace(/\D/g, "");
  if (phone && phone.length >= 8) return `p:${phone}`;
  const email = row.email?.trim().toLowerCase();
  return email ? `e:${email}` : null;
}

export async function buildAiAnalyticsSnapshot(now = new Date()) {
  const periodEnd = now;
  const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousStart = new Date(periodStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [orderRows, draftRows, cartRows, behaviorRows, productRows, reviewRows, notifyRows, couponRows, feedbackRows, flyerRows] =
    await Promise.all([
      db
        .select({
          sessionId: orders.sessionId,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          trackingNumber: orders.trackingNumber,
          shippedAt: orders.shippedAt,
          deliveredAt: orders.deliveredAt,
          grandTotal: orders.grandTotal,
          state: orders.state,
          cartSnapshot: orders.cartSnapshot,
          createdAt: orders.createdAt,
          phone: orders.phone,
          email: orders.email,
          ipAddress: orders.ipAddress,
          userAgent: orders.userAgent,
        })
        .from(orders)
        .where(and(gte(orders.createdAt, previousStart), lte(orders.createdAt, periodEnd)))
        .limit(10000),
      db
        .select({
          sessionId: checkoutDrafts.sessionId,
          status: checkoutDrafts.status,
          grandTotal: checkoutDrafts.grandTotal,
          state: checkoutDrafts.state,
          cartSnapshot: checkoutDrafts.cartSnapshot,
          updatedAt: checkoutDrafts.updatedAt,
          phone: checkoutDrafts.phone,
          email: checkoutDrafts.email,
          ipAddress: checkoutDrafts.ipAddress,
          userAgent: checkoutDrafts.userAgent,
        })
        .from(checkoutDrafts)
        .where(and(gte(checkoutDrafts.updatedAt, previousStart), lte(checkoutDrafts.updatedAt, periodEnd)))
        .limit(10000),
      db
        .select({
          sessionId: cartEvents.sessionId,
          eventType: cartEvents.eventType,
          productName: cartEvents.productName,
          quantity: cartEvents.quantity,
          price: cartEvents.price,
          createdAt: cartEvents.createdAt,
          ipAddress: cartEvents.ipAddress,
          userAgent: cartEvents.userAgent,
        })
        .from(cartEvents)
        .where(and(gte(cartEvents.createdAt, previousStart), lte(cartEvents.createdAt, periodEnd)))
        .limit(10000),
      db
        .select({
          sessionId: behavioralEvents.sessionId,
          eventType: behavioralEvents.eventType,
          path: behavioralEvents.path,
          sectionName: behavioralEvents.sectionName,
          scrollDepth: behavioralEvents.scrollDepth,
          createdAt: behavioralEvents.createdAt,
          ipAddress: behavioralEvents.ipAddress,
          userAgent: behavioralEvents.userAgent,
        })
        .from(behavioralEvents)
        .where(and(gte(behavioralEvents.createdAt, previousStart), lte(behavioralEvents.createdAt, periodEnd)))
        .limit(10000),
      db
        .select({
          id: products.id,
          name: products.name,
          category: products.category,
          visibility: products.visibility,
          badges: products.badges,
          images: products.images,
        })
        .from(products)
        .limit(2000),
      db
        .select({ productId: reviews.productId, rating: reviews.rating, verified: reviews.verified, createdAt: reviews.createdAt })
        .from(reviews)
        .where(lte(reviews.createdAt, periodEnd))
        .limit(10000),
      db
        .select({ productName: stockNotifyRequests.productName, status: stockNotifyRequests.status, createdAt: stockNotifyRequests.createdAt })
        .from(stockNotifyRequests)
        .where(and(gte(stockNotifyRequests.createdAt, periodStart), lte(stockNotifyRequests.createdAt, periodEnd)))
        .limit(5000),
      db
        .select({ channel: couponCodeEvents.channel, eventType: couponCodeEvents.eventType, createdAt: couponCodeEvents.createdAt })
        .from(couponCodeEvents)
        .where(and(gte(couponCodeEvents.createdAt, periodStart), lte(couponCodeEvents.createdAt, periodEnd)))
        .limit(5000),
      db
        .select({ rating: customerFeedback.rating, source: customerFeedback.source, createdAt: customerFeedback.createdAt })
        .from(customerFeedback)
        .where(and(gte(customerFeedback.createdAt, periodStart), lte(customerFeedback.createdAt, periodEnd)))
        .limit(5000),
      db
        .select({ city: flyerCampaignEvents.city, eventType: flyerCampaignEvents.eventType, revenue: flyerCampaignEvents.revenue, createdAt: flyerCampaignEvents.createdAt })
        .from(flyerCampaignEvents)
        .where(and(gte(flyerCampaignEvents.createdAt, periodStart), lte(flyerCampaignEvents.createdAt, periodEnd)))
        .limit(5000),
    ]);

  const excludedSessionIds = collectExcludedSessionIds(orderRows, draftRows, cartRows, behaviorRows);
  const safeOrders = filterExcludedAdminRows(orderRows, excludedSessionIds) as SafeOrder[];
  const safeDrafts = filterExcludedAdminRows(draftRows, excludedSessionIds);
  const safeCart = filterExcludedAdminRows(cartRows, excludedSessionIds);
  const safeBehavior = filterExcludedAdminRows(behaviorRows, excludedSessionIds);
  const currentOrders = safeOrders.filter((row) => row.createdAt >= periodStart);
  const previousOrders = safeOrders.filter((row) => row.createdAt < periodStart);
  const currentSales = summarizeOrders(currentOrders);
  const previousSales = summarizeOrders(previousOrders);

  const currentCart = safeCart.filter((row) => row.createdAt >= periodStart);
  const previousCart = safeCart.filter((row) => row.createdAt < periodStart);
  const currentDrafts = safeDrafts.filter((row) => row.updatedAt >= periodStart);
  const previousDrafts = safeDrafts.filter((row) => row.updatedAt < periodStart);
  const currentBehavior = safeBehavior.filter((row) => row.createdAt >= periodStart);
  const previousBehavior = safeBehavior.filter((row) => row.createdAt < periodStart);

  const funnel = (behavior: typeof safeBehavior, cart: typeof safeCart, drafts: typeof safeDrafts, orderData: SafeOrder[]) => {
    const visitors = new Set(behavior.map((row) => row.sessionId)).size;
    const cartVisitors = new Set(cart.map((row) => row.sessionId)).size;
    const addToCart = cart.filter((row) => row.eventType === "add_to_cart").length;
    const checkoutSessions = new Set(drafts.map((row) => row.sessionId)).size;
    const qualifiedOrders = orderData.filter(isRevenueQualifiedOrder).length;
    return {
      visitors,
      cartVisitors,
      addToCart,
      checkoutSessions,
      qualifiedOrders,
      visitorToCartRate: safeRate(cartVisitors, visitors),
      cartToCheckoutRate: safeRate(checkoutSessions, cartVisitors),
      checkoutToOrderRate: safeRate(qualifiedOrders, checkoutSessions),
      visitorToOrderRate: safeRate(qualifiedOrders, visitors),
    };
  };

  const currentFunnel = funnel(currentBehavior, currentCart, currentDrafts, currentOrders);
  const previousFunnel = funnel(previousBehavior, previousCart, previousDrafts, previousOrders);
  const productDemand = new Map<string, number>();
  currentCart
    .filter((row) => row.eventType === "add_to_cart" && row.productName)
    .forEach((row) => increment(productDemand, row.productName || "", Math.max(1, row.quantity || 1)));
  currentDrafts.forEach((row) =>
    (row.cartSnapshot || []).forEach((item) => !item.isGift && increment(productDemand, item.name, item.quantity || 1)),
  );
  currentOrders.filter(isRevenueQualifiedOrder).forEach((row) =>
    row.cartSnapshot.forEach((item) => !item.isGift && increment(productDemand, item.name, (item.quantity || 1) * 2)),
  );

  const orderedProducts = new Map<string, number>();
  currentOrders.filter(isRevenueQualifiedOrder).forEach((row) =>
    row.cartSnapshot.forEach((item) => !item.isGift && increment(orderedProducts, item.name, item.quantity || 1)),
  );
  const regions = new Map<string, number>();
  currentOrders.forEach((row) => row.state && increment(regions, row.state));
  const safeRegions = topEntries(regions, 10).filter((entry) => entry.value >= 3);
  const pageViews = new Map<string, number>();
  currentBehavior
    .filter((row) => row.eventType === "page_view" && row.path)
    .forEach((row) => increment(pageViews, String(row.path).split("?")[0]));

  const customerCounts = new Map<string, number>();
  currentOrders.filter(isRevenueQualifiedOrder).forEach((row) => {
    const key = customerKey(row);
    if (key) increment(customerCounts, key);
  });
  const repeatCustomers = Array.from(customerCounts.values()).filter((count) => count > 1).length;

  const averageRating = reviewRows.length
    ? Math.round((reviewRows.reduce((sum, row) => sum + money(row.rating), 0) / reviewRows.length) * 10) / 10
    : 0;
  const productNameById = new Map(productRows.map((row) => [row.id, row.name]));
  const reviewDemand = new Map<string, number>();
  reviewRows
    .filter((row) => row.createdAt >= periodStart)
    .forEach((row) => increment(reviewDemand, productNameById.get(row.productId) || "Unknown product"));
  const notifyDemand = new Map<string, number>();
  notifyRows.forEach((row) => increment(notifyDemand, row.productName));
  const couponMix = new Map<string, number>();
  couponRows.forEach((row) => increment(couponMix, `${row.channel}:${row.eventType}`));
  const flyerMix = new Map<string, number>();
  flyerRows.forEach((row) => increment(flyerMix, row.eventType));
  const feedbackSources = new Map<string, number>();
  feedbackRows.forEach((row) => increment(feedbackSources, row.source));

  const snapshot = {
    period: {
      currentFrom: periodStart.toISOString(),
      currentTo: periodEnd.toISOString(),
      previousFrom: previousStart.toISOString(),
      previousTo: periodStart.toISOString(),
      timezone: "Asia/Kolkata",
    },
    sales: {
      current: currentSales,
      previous: previousSales,
      change: {
        revenuePercent: percentChange(currentSales.revenue, previousSales.revenue),
        ordersPercent: percentChange(currentSales.qualifiedOrders, previousSales.qualifiedOrders),
        unitsPercent: percentChange(currentSales.units, previousSales.units),
        averageOrderValuePercent: percentChange(currentSales.averageOrderValue, previousSales.averageOrderValue),
      },
      topOrderedProducts: topEntries(orderedProducts),
      regionsWithAtLeastThreeOrders: safeRegions,
    },
    conversion: {
      current: currentFunnel,
      previous: previousFunnel,
      abandonedDrafts: currentDrafts.filter((row) => !["complete", "converted"].includes(row.status)).length,
      abandonedDraftValue: currentDrafts
        .filter((row) => !["complete", "converted"].includes(row.status))
        .reduce((sum, row) => sum + money(row.grandTotal), 0),
      topViewedPages: topEntries(pageViews),
    },
    catalog: {
      products: productRows.length,
      publicProducts: productRows.filter((row) => row.visibility === "public").length,
      soldOutProducts: productRows.filter((row) => row.badges?.soldOut).length,
      limitedStockProducts: productRows.filter((row) => row.badges?.limitedStock).length,
      discoveryProducts: productRows.filter((row) => row.badges?.showInDiscoverySet).length,
      productsMissingImages: productRows.filter((row) => !row.images?.length).length,
      averageRating,
      totalReviews: reviewRows.length,
      newReviewsThisWeek: reviewRows.filter((row) => row.createdAt >= periodStart).length,
      productsReceivingReviews: topEntries(reviewDemand),
      productDemandSignals: topEntries(productDemand),
    },
    stock: {
      persistentInventoryAvailable: false,
      limitedStockProductFlags: productRows.filter((row) => row.badges?.limitedStock).length,
      soldOutProductFlags: productRows.filter((row) => row.badges?.soldOut).length,
      notifyRequestsThisWeek: notifyRows.length,
      topNotifyProducts: topEntries(notifyDemand),
      note: "Inventory quantities are frontend-only and are intentionally excluded from AI analysis.",
    },
    customers: {
      identifiedOrderingCustomers: customerCounts.size,
      repeatOrderingCustomersThisWeek: repeatCustomers,
      repeatCustomerRate: safeRate(repeatCustomers, customerCounts.size),
      feedbackCount: feedbackRows.length,
      averageFeedbackRating: feedbackRows.length
        ? Math.round((feedbackRows.reduce((sum, row) => sum + row.rating, 0) / feedbackRows.length) * 10) / 10
        : 0,
      feedbackSourceMix: topEntries(feedbackSources),
    },
    marketing: {
      couponActivity: topEntries(couponMix),
      flyerActivity: topEntries(flyerMix),
      flyerRevenue: flyerRows.reduce((sum, row) => sum + money(row.revenue), 0),
      topLandingPages: topEntries(pageViews),
    },
    system: {
      generatedFrom: [
        "orders",
        "checkout_drafts",
        "cart_events",
        "behavioral_events",
        "products",
        "reviews",
        "stock_notify_requests",
        "coupon_code_events",
        "customer_feedback",
        "flyer_campaign_events",
      ],
      recordCoverage: {
        orders: currentOrders.length,
        checkoutDrafts: currentDrafts.length,
        cartEvents: currentCart.length,
        behavioralEvents: currentBehavior.length,
      },
      privacy: "Aggregated metrics only; direct customer identifiers are excluded.",
    },
  };

  return {
    snapshot,
    inputHash: createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"),
    periodStart,
    periodEnd,
  };
}

export type AiAnalyticsSnapshot = Awaited<ReturnType<typeof buildAiAnalyticsSnapshot>>["snapshot"];
