import "server-only";

import { createHash } from "node:crypto";
import { and, gte, lt, or } from "drizzle-orm";

import { db } from "@/db";
import {
  behavioralEvents,
  cartEvents,
  checkoutDrafts,
  couponCodeEvents,
  customerFeedback,
  flyerCampaignEvents,
  orders,
  safeDiagnostics,
  products,
  reviews,
  stockNotifyRequests,
} from "@/db/schema";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";

import { completedBusinessWeeks, businessContext, percentChange, safeAnalyticsPath, capturedFundsInWindow } from "./business-context";
import { readCheckoutActivity } from "../checkout-activity";

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
  paymentCapturedAt: Date | null;
  capturedPaymentAmount: string | null;
  checkoutChannel: string;
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

function isRevenueQualifiedOrder(order: SafeOrder) {
  if (["cancelled", "payment_pending", "payment_failed", "refunded", "partially_refunded"].includes(order.status)) {
    return false;
  }
  return Boolean(
    order.paymentCapturedAt || order.trackingNumber ||
      order.shippedAt ||
      order.deliveredAt ||
      ["shipped", "delivered", "complete"].includes(order.status) ||
      (["processing", "packed"].includes(order.status) && order.paymentMethod),
  );
}

function orderUnits(order: SafeOrder) {
  return order.cartSnapshot.reduce(
    (sum, item) => sum + (item.isGift ? 0 : Math.max(0, Number(item.quantity || 0))),
    0,
  );
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
  const revenue = rows.reduce((sum, row) => sum + (row.paymentCapturedAt ? money(row.capturedPaymentAmount) : 0), 0);
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
    qualifiedOrderValue: qualified.reduce((sum, row) => sum + money(row.grandTotal), 0),
    capturedOrders: rows.filter(row => row.paymentCapturedAt).length,
    units,
    averageOrderValue: qualified.length ? Math.round(qualified.reduce((sum, row) => sum + money(row.grandTotal), 0) / qualified.length) : 0,
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
  const { periodEnd, periodStart, previousStart } = completedBusinessWeeks(now);

  const [orderRows, draftRows, cartRows, behaviorRows, productRows, reviewRows, notifyRows, couponRows, feedbackRows, flyerRows, diagnosticRows] =
    await Promise.all([
      db
        .select({
          sessionId: orders.sessionId,
          status: orders.status,
          paymentMethod: orders.paymentMethod,
          checkoutChannel: orders.checkoutChannel,
          capturedPaymentAmount: orders.capturedPaymentAmount,
          paymentCapturedAt: orders.paymentCapturedAt,
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
        .where(or(and(gte(orders.createdAt, previousStart), lt(orders.createdAt, periodEnd)), and(gte(orders.paymentCapturedAt, previousStart), lt(orders.paymentCapturedAt, periodEnd))))
        .limit(10000),
      db
        .select({
          sessionId: checkoutDrafts.sessionId,
          status: checkoutDrafts.status,
          grandTotal: checkoutDrafts.grandTotal,
          state: checkoutDrafts.state,
          cartSnapshot: checkoutDrafts.cartSnapshot,
          updatedAt: checkoutDrafts.updatedAt,
          createdAt: checkoutDrafts.createdAt,
          pricingBreakdown: checkoutDrafts.pricingBreakdown,
          phone: checkoutDrafts.phone,
          email: checkoutDrafts.email,
          ipAddress: checkoutDrafts.ipAddress,
          userAgent: checkoutDrafts.userAgent,
        })
        .from(checkoutDrafts)
        .where(and(gte(checkoutDrafts.createdAt, previousStart), lt(checkoutDrafts.createdAt, periodEnd)))
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
        .where(and(gte(cartEvents.createdAt, previousStart), lt(cartEvents.createdAt, periodEnd)))
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
        .where(and(gte(behavioralEvents.createdAt, previousStart), lt(behavioralEvents.createdAt, periodEnd)))
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
        .where(lt(reviews.createdAt, periodEnd))
        .limit(10000),
      db
        .select({ productName: stockNotifyRequests.productName, status: stockNotifyRequests.status, createdAt: stockNotifyRequests.createdAt })
        .from(stockNotifyRequests)
        .where(and(gte(stockNotifyRequests.createdAt, periodStart), lt(stockNotifyRequests.createdAt, periodEnd)))
        .limit(5000),
      db
        .select({ channel: couponCodeEvents.channel, eventType: couponCodeEvents.eventType, createdAt: couponCodeEvents.createdAt })
        .from(couponCodeEvents)
        .where(and(gte(couponCodeEvents.createdAt, periodStart), lt(couponCodeEvents.createdAt, periodEnd)))
        .limit(5000),
      db
        .select({ rating: customerFeedback.rating, source: customerFeedback.source, createdAt: customerFeedback.createdAt })
        .from(customerFeedback)
        .where(and(gte(customerFeedback.createdAt, periodStart), lt(customerFeedback.createdAt, periodEnd)))
        .limit(5000),
      db
        .select({ city: flyerCampaignEvents.city, eventType: flyerCampaignEvents.eventType, revenue: flyerCampaignEvents.revenue, createdAt: flyerCampaignEvents.createdAt })
        .from(flyerCampaignEvents)
        .where(and(gte(flyerCampaignEvents.createdAt, periodStart), lt(flyerCampaignEvents.createdAt, periodEnd)))
        .limit(5000),
      db.select({ code: safeDiagnostics.code, at: safeDiagnostics.occurredAt }).from(safeDiagnostics).where(and(gte(safeDiagnostics.occurredAt, previousStart), lt(safeDiagnostics.occurredAt, periodEnd))).limit(10000),
    ]);

  const excludedSessionIds = collectExcludedSessionIds(orderRows, draftRows, cartRows, behaviorRows);
  const safeOrders = filterExcludedAdminRows(orderRows, excludedSessionIds) as SafeOrder[];
  const safeDrafts = filterExcludedAdminRows(draftRows, excludedSessionIds);
  const safeCart = filterExcludedAdminRows(cartRows, excludedSessionIds);
  const safeBehavior = filterExcludedAdminRows(behaviorRows, excludedSessionIds);
  const currentOrders = safeOrders.filter((row) => row.createdAt >= periodStart && row.createdAt < periodEnd);
  const previousOrders = safeOrders.filter((row) => row.createdAt >= previousStart && row.createdAt < periodStart);
  const collected = (start: Date, end: Date) => capturedFundsInWindow(safeOrders, start, end);
  const currentSales = { ...summarizeOrders(currentOrders), revenue: collected(periodStart, periodEnd) };
  const previousSales = { ...summarizeOrders(previousOrders), revenue: collected(previousStart, periodStart) };

  const currentCart = safeCart.filter((row) => row.createdAt >= periodStart);
  const previousCart = safeCart.filter((row) => row.createdAt < periodStart);
  const currentDrafts = safeDrafts.filter((row) => row.createdAt >= periodStart);
  const previousDrafts = safeDrafts.filter((row) => row.createdAt < periodStart);
  const currentBehavior = safeBehavior.filter((row) => row.createdAt >= periodStart);
  const previousBehavior = safeBehavior.filter((row) => row.createdAt < periodStart);

  const funnel = (behavior: typeof safeBehavior, cart: typeof safeCart, drafts: typeof safeDrafts, orderData: SafeOrder[]) => {
    const visitors = new Set([
      ...behavior.map((row) => row.sessionId),
      ...cart.map((row) => row.sessionId),
      ...drafts.map((row) => row.sessionId),
      ...orderData.map((row) => row.sessionId),
    ].filter(Boolean)).size;
    const cartVisitors = new Set(cart.map((row) => row.sessionId)).size;
    const addToCart = cart.filter((row) => row.eventType === "add_to_cart").length;
    const checkoutIds = new Set(drafts.map((row) => row.sessionId));
    const checkoutSessions = checkoutIds.size;
    const convertedSessions = new Set(orderData.filter(isRevenueQualifiedOrder).filter(row => checkoutIds.has(row.sessionId)).map(row => row.sessionId)).size;
    const qualifiedOrders = orderData.filter(isRevenueQualifiedOrder).length;
    return {
      visitors,
      cartVisitors,
      addToCart,
      checkoutSessions,
      qualifiedOrders,
      matchedConvertedSessions: convertedSessions,
      visitorToCartRate: safeRate(cartVisitors, visitors),
      cartToCheckoutRate: safeRate(checkoutSessions, cartVisitors),
      checkoutToOrderRate: safeRate(convertedSessions, checkoutSessions),
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
    .forEach((row) => increment(pageViews, safeAnalyticsPath(String(row.path))));

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

  const activityCounts = (start: Date, end: Date) => {
    const counts = new Map<string, number>();
    safeDrafts.forEach(draft => readCheckoutActivity(draft.pricingBreakdown?.checkoutActivity).filter(event => new Date(event.at) >= start && new Date(event.at) < end).forEach(event => increment(counts, event.event)));
    return topEntries(counts, 25);
  };
  const snapshot = {
    businessContext,
    dataQuality: { confidence: currentOrders.length < 30 || currentFunnel.checkoutSessions < 100 ? "low" : "medium", caveats: ["Small weekly samples can cause large percentage swings; quote raw counts alongside rates.", "Drafts are a creation-week cohort and mutable; later resumes can change historical classification.", "Captured amounts are gross Razorpay captures, not net revenue, settlements, profit or proof of COD collection.", "Missing tracking events do not prove a customer motive; blocked cookies and missing telemetry can affect coverage.", "Results are capped; reaching a query cap means coverage is incomplete.", "Historic reports before business context v2 used different revenue and window definitions; do not compare their headline numbers directly."], queryCapsReached: { orders: orderRows.length >= 10000, drafts: draftRows.length >= 10000, cart: cartRows.length >= 10000, behavior: behaviorRows.length >= 10000, diagnostics: diagnosticRows.length >= 10000 } },
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
      fulfillment: { paidAwaitingDispatch: currentOrders.filter(row => row.paymentCapturedAt && !row.shippedAt && !["shipped", "delivered", "cancelled", "refunded"].includes(row.status)).length, shippedMissingTracking: currentOrders.filter(row => row.status === "shipped" && !row.trackingNumber).length },
      topOrderedProducts: topEntries(orderedProducts),
      regionsWithAtLeastThreeOrders: safeRegions,
    },
    conversion: {
      current: currentFunnel,
      previous: previousFunnel,
      observedStages: { current: activityCounts(periodStart, periodEnd), previous: activityCounts(previousStart, periodStart), note: "Counts of retained events on drafts created in the two-week cohort, not unique customers; history can be truncated." },
      abandonedDrafts: currentDrafts.filter((row) => !["complete", "converted"].includes(row.status)).length,
      abandonedDraftValue: currentDrafts
        .filter((row) => !["complete", "converted"].includes(row.status))
        .reduce((sum, row) => sum + money(row.grandTotal), 0),
      topViewedPages: topEntries(pageViews),
    },
    catalog: {
      products: productRows.length,
      publicSoldOutProducts: productRows.filter(row => row.visibility === "public" && row.badges?.soldOut).length,
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
      note: "This snapshot exposes catalogue availability flags, not verified warehouse quantities or historical stock movement.",
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
      diagnostics: { current: topEntries(diagnosticRows.filter(row => row.at >= periodStart).reduce((map, row) => { increment(map, row.code); return map; }, new Map<string, number>())), previous: topEntries(diagnosticRows.filter(row => row.at < periodStart).reduce((map, row) => { increment(map, row.code); return map; }, new Map<string, number>())) },
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
