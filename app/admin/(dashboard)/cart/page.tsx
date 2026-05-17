import { db } from "@/db";
import { cartEvents, checkoutDrafts, couponCodeEvents, orders, sessionIntelligence } from "@/db/schema";
import { desc, gte } from "drizzle-orm";
import { ShoppingCart } from "lucide-react";
import { CartLeadsTable, type CartLeadRow } from "./CartLeadsTable";
import { formatINR } from "@/lib/currency";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";

export const dynamic = "force-dynamic";

function money(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0") || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function isEmail(value: string | null | undefined): boolean {
  return String(value ?? "").includes("@");
}

function normalizePhone(value: string | null | undefined): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return digits.length === 10 ? `91${digits}` : digits;
}

function contactKey(value: string | null | undefined): string | null {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("@")) return `email:${raw}`;
  const phone = normalizePhone(raw);
  return phone ? `phone:${phone}` : null;
}

function productKey(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string }> | { hours?: string };
};

type RewardSignal = {
  code: string | null;
  label: string | null;
  percent: number;
  expiresAt: number | null;
  createdAt: Date;
};

function readRewardSignal(payload: Record<string, unknown>, createdAt: Date): RewardSignal | null {
  const directReward = payload.welcomeBackReward;
  const reward =
    directReward && typeof directReward === "object"
      ? (directReward as Record<string, unknown>)
      : payload;

  const rawPercent = Number(reward.percent ?? reward.rewardPercent ?? reward.tier);
  if (rawPercent !== 5 && rawPercent !== 10) return null;

  const expiresAt = Number(reward.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt < createdAt.getTime()) return null;

  return {
    code: String(reward.code ?? reward.couponCode ?? "").trim() || null,
    label: String(reward.label ?? reward.rewardLabel ?? "").trim() || null,
    percent: rawPercent,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    createdAt,
  };
}

function getDiscountedValue(value: number, rewardPercent: number | null): number {
  if (!rewardPercent) return value;
  return Math.max(0, value - (value * rewardPercent) / 100);
}

function mergeProducts(
  left: CartLeadRow["products"],
  right: CartLeadRow["products"],
): CartLeadRow["products"] {
  const map = new Map<string, { name: string; quantity: number; value: number }>();

  for (const product of [...left, ...right]) {
    const key = productKey(product.name) || product.name;
    const existing = map.get(key);
    map.set(key, {
      name: existing?.name || product.name,
      quantity: Math.max(existing?.quantity || 0, product.quantity),
      value: Math.max(existing?.value || 0, product.value),
    });
  }

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

function getLeadJourneyKey(row: CartLeadRow): string {
  if (row.normalizedPhone) return `phone:${row.normalizedPhone}`;
  if (row.email) return `email:${row.email.trim().toLowerCase()}`;
  if (row.couponDestination) {
    const key = contactKey(row.couponDestination);
    if (key) return key;
  }
  if (row.anonymousJourneyKey) return `anonymous:${row.anonymousJourneyKey}`;
  if (row.checkoutId) return `checkout:${row.checkoutId}`;
  return `session:${row.sessionId}`;
}

function mergeCartLeadRows(rows: CartLeadRow[]): CartLeadRow[] {
  const map = new Map<string, CartLeadRow>();

  for (const row of rows) {
    const key = getLeadJourneyKey(row);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { ...row, sessionIds: [row.sessionId] });
      continue;
    }

    const latestExisting = new Date(existing.latestActivity).getTime();
    const latestIncoming = new Date(row.latestActivity).getTime();
    const newest = latestIncoming > latestExisting ? row : existing;
    const checkoutValue = Math.max(existing.checkoutValue || 0, row.checkoutValue || 0) || null;
    const orderValue = Math.max(existing.orderValue || 0, row.orderValue || 0) || null;
    const rewardPercent = Math.max(existing.rewardPercent || 0, row.rewardPercent || 0) || null;
    const originalCartSignalValue = Math.max(
      existing.originalCartSignalValue || existing.cartSignalValue,
      row.originalCartSignalValue || row.cartSignalValue,
    );
    const currentCartSignalValue =
      checkoutValue ||
      (rewardPercent
        ? getDiscountedValue(originalCartSignalValue, rewardPercent)
        : Math.max(existing.cartSignalValue, row.cartSignalValue));
    const discountAmount =
      rewardPercent && originalCartSignalValue > currentCartSignalValue
        ? originalCartSignalValue - currentCartSignalValue
        : null;
    const sessionIds = Array.from(
      new Set([...(existing.sessionIds || [existing.sessionId]), row.sessionId]),
    );

    map.set(key, {
      ...existing,
      sessionId: newest.sessionId,
      sessionIds,
      anonymousJourneyKey:
        newest.anonymousJourneyKey || existing.anonymousJourneyKey || row.anonymousJourneyKey,
      name: newest.name || existing.name || row.name,
      phone: newest.phone || existing.phone || row.phone,
      normalizedPhone: newest.normalizedPhone || existing.normalizedPhone || row.normalizedPhone,
      email: newest.email || existing.email || row.email,
      latestActivity: newest.latestActivity,
      activityCount: existing.activityCount + row.activityCount,
      cartOpens: existing.cartOpens + row.cartOpens,
      addToCartCount: existing.addToCartCount + row.addToCartCount,
      removeCount: existing.removeCount + row.removeCount,
      quantityUpdates: existing.quantityUpdates + row.quantityUpdates,
      rewardBannerClicks: existing.rewardBannerClicks + row.rewardBannerClicks,
      cartSignalValue: currentCartSignalValue,
      originalCartSignalValue:
        discountAmount || existing.originalCartSignalValue || row.originalCartSignalValue
          ? originalCartSignalValue
          : null,
      discountAmount,
      rewardCode: newest.rewardCode || existing.rewardCode || row.rewardCode,
      rewardLabel: newest.rewardLabel || existing.rewardLabel || row.rewardLabel,
      rewardPercent,
      rewardEvidence: existing.rewardEvidence || row.rewardEvidence,
      products: mergeProducts(existing.products, row.products),
      potentialScore: Math.max(existing.potentialScore, row.potentialScore),
      hasContact: existing.hasContact || row.hasContact,
      hasCoupon: existing.hasCoupon || row.hasCoupon,
      couponCode: newest.couponCode || existing.couponCode || row.couponCode,
      couponChannel: newest.couponChannel || existing.couponChannel || row.couponChannel,
      couponDestination:
        newest.couponDestination || existing.couponDestination || row.couponDestination,
      hasCheckout: existing.hasCheckout || row.hasCheckout,
      connectionSource:
        existing.connectionSource === "session" || row.connectionSource === "session"
          ? "session"
          : existing.connectionSource || row.connectionSource,
      checkoutId: newest.checkoutId || existing.checkoutId || row.checkoutId,
      checkoutStatus: newest.checkoutStatus || existing.checkoutStatus || row.checkoutStatus,
      checkoutValue,
      checkoutLeadStatus:
        newest.checkoutLeadStatus || existing.checkoutLeadStatus || row.checkoutLeadStatus,
      checkoutLastEditedField:
        newest.checkoutLastEditedField ||
        existing.checkoutLastEditedField ||
        row.checkoutLastEditedField,
      hasOrder: existing.hasOrder || row.hasOrder,
      orderNumber: newest.orderNumber || existing.orderNumber || row.orderNumber,
      orderStatus: newest.orderStatus || existing.orderStatus || row.orderStatus,
      orderValue,
      intentScore: Math.max(existing.intentScore || 0, row.intentScore || 0) || null,
      abandonmentRisk:
        Math.max(existing.abandonmentRisk || 0, row.abandonmentRisk || 0) || null,
      predictedNextAction:
        newest.predictedNextAction || existing.predictedNextAction || row.predictedNextAction,
    });
  }

  return Array.from(map.values());
}

export default async function CartLeadsPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours);
  let rows: CartLeadRow[] = [];
  let dbError = false;

  try {
    const cartRows = await db
      .select({
        id: cartEvents.id,
        sessionId: cartEvents.sessionId,
        eventType: cartEvents.eventType,
        productId: cartEvents.productId,
        productName: cartEvents.productName,
        price: cartEvents.price,
        quantity: cartEvents.quantity,
        path: cartEvents.path,
        country: cartEvents.country,
        ipAddress: cartEvents.ipAddress,
        userAgent: cartEvents.userAgent,
        payload: cartEvents.payload,
        createdAt: cartEvents.createdAt,
      })
      .from(cartEvents)
      .where(gte(cartEvents.createdAt, timeWindow.since))
      .orderBy(desc(cartEvents.createdAt))
      .limit(1500);

    let [couponRows, draftRows, orderRows, intelligenceRows] = await Promise.all([
      db
        .select({
          sessionId: couponCodeEvents.sessionId,
          channel: couponCodeEvents.channel,
          couponCode: couponCodeEvents.couponCode,
          destination: couponCodeEvents.destination,
          ipAddress: couponCodeEvents.ipAddress,
          userAgent: couponCodeEvents.userAgent,
          createdAt: couponCodeEvents.createdAt,
        })
        .from(couponCodeEvents)
        .where(gte(couponCodeEvents.createdAt, timeWindow.since))
        .orderBy(desc(couponCodeEvents.createdAt))
        .limit(1000),
      db
        .select({
          id: checkoutDrafts.id,
          sessionId: checkoutDrafts.sessionId,
          status: checkoutDrafts.status,
          fullName: checkoutDrafts.fullName,
          phone: checkoutDrafts.phone,
          email: checkoutDrafts.email,
          grandTotal: checkoutDrafts.grandTotal,
          leadStatus: checkoutDrafts.leadStatus,
          lastEditedField: checkoutDrafts.lastEditedField,
          cartSnapshot: checkoutDrafts.cartSnapshot,
          ipAddress: checkoutDrafts.ipAddress,
          userAgent: checkoutDrafts.userAgent,
          updatedAt: checkoutDrafts.updatedAt,
        })
        .from(checkoutDrafts)
        .where(gte(checkoutDrafts.updatedAt, timeWindow.since))
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(1000),
      db
        .select({
          sessionId: orders.sessionId,
          orderNumber: orders.orderNumber,
          status: orders.status,
          phone: orders.phone,
          email: orders.email,
          grandTotal: orders.grandTotal,
          ipAddress: orders.ipAddress,
          userAgent: orders.userAgent,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(gte(orders.createdAt, timeWindow.since))
        .orderBy(desc(orders.createdAt))
        .limit(1000),
      db
        .select({
          sessionId: sessionIntelligence.sessionId,
          intentScore: sessionIntelligence.intentScore,
          abandonmentRisk: sessionIntelligence.abandonmentRisk,
          predictedNextAction: sessionIntelligence.predictedNextAction,
          lastActiveAt: sessionIntelligence.lastActiveAt,
        })
        .from(sessionIntelligence)
        .where(gte(sessionIntelligence.updatedAt, timeWindow.since))
        .orderBy(desc(sessionIntelligence.updatedAt))
        .limit(1000),
    ]);

    const excludedSessionIds = collectExcludedSessionIds(cartRows, couponRows, draftRows, orderRows);
    const visibleCartRows = filterExcludedAdminRows(cartRows, excludedSessionIds);
    couponRows = filterExcludedAdminRows(couponRows, excludedSessionIds);
    draftRows = filterExcludedAdminRows(draftRows, excludedSessionIds);
    orderRows = filterExcludedAdminRows(orderRows, excludedSessionIds);
    intelligenceRows = intelligenceRows.filter((row) => !excludedSessionIds.has(row.sessionId));

    const couponMap = new Map<string, (typeof couponRows)[number]>();
    const couponContactMap = new Map<string, (typeof couponRows)[number]>();
    for (const coupon of couponRows) {
      if (coupon.sessionId && !couponMap.has(coupon.sessionId)) couponMap.set(coupon.sessionId, coupon);
      const key = contactKey(coupon.destination);
      if (key && !couponContactMap.has(key)) couponContactMap.set(key, coupon);
    }

    const draftMap = new Map<string, (typeof draftRows)[number]>();
    const draftContactMap = new Map<string, (typeof draftRows)[number]>();
    for (const draft of draftRows) {
      draftMap.set(draft.sessionId, draft);
      for (const key of [contactKey(draft.phone), contactKey(draft.email)]) {
        if (key && !draftContactMap.has(key)) draftContactMap.set(key, draft);
      }
    }

    const orderMap = new Map<string, (typeof orderRows)[number]>();
    const orderContactMap = new Map<string, (typeof orderRows)[number]>();
    for (const order of orderRows) {
      orderMap.set(order.sessionId, order);
      for (const key of [contactKey(order.phone), contactKey(order.email)]) {
        if (key && !orderContactMap.has(key)) orderContactMap.set(key, order);
      }
    }

    const intelligenceMap = new Map<string, (typeof intelligenceRows)[number]>();
    for (const intelligence of intelligenceRows) {
      intelligenceMap.set(intelligence.sessionId, intelligence);
    }

    const rewardMap = new Map<string, RewardSignal>();
    for (const event of visibleCartRows) {
      const reward = readRewardSignal(
        (event.payload || {}) as Record<string, unknown>,
        event.createdAt,
      );
      if (!reward) continue;
      const existing = rewardMap.get(event.sessionId);
      if (!existing || reward.percent > existing.percent || reward.createdAt > existing.createdAt) {
        rewardMap.set(event.sessionId, reward);
      }
    }

    const sessionMap = new Map<
      string,
      {
        sessionId: string;
        latestActivity: Date;
        cartOpens: number;
        addToCartCount: number;
        removeCount: number;
        quantityUpdates: number;
        rewardBannerClicks: number;
        cartSignalValue: number;
        ipAddress: string | null;
        userAgent: string | null;
        products: Map<string, { name: string; quantity: number; value: number }>;
      }
    >();

    for (const event of visibleCartRows) {
      const existing = sessionMap.get(event.sessionId);
      const entry =
        existing ??
        {
          sessionId: event.sessionId,
          latestActivity: event.createdAt,
          cartOpens: 0,
          addToCartCount: 0,
          removeCount: 0,
        quantityUpdates: 0,
        rewardBannerClicks: 0,
        cartSignalValue: 0,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
          products: new Map<string, { name: string; quantity: number; value: number }>(),
        };

      if (event.createdAt > entry.latestActivity) entry.latestActivity = event.createdAt;
      if (event.ipAddress) entry.ipAddress = event.ipAddress;
      if (event.userAgent) entry.userAgent = event.userAgent;
      if (event.eventType === "cart_open") entry.cartOpens += 1;
      if (event.eventType === "remove_from_cart") entry.removeCount += 1;
      if (event.eventType === "update_cart_quantity") entry.quantityUpdates += 1;
      if (event.eventType === "reward_banner_click") entry.rewardBannerClicks += 1;

      if (event.eventType === "add_to_cart") {
        entry.addToCartCount += 1;
        const quantity = event.quantity || 1;
        const value = money(event.price) * quantity;
        entry.cartSignalValue = Math.max(entry.cartSignalValue, value);
        const productKey = event.productId || event.productName || "unknown";
        const product = entry.products.get(productKey);
        entry.products.set(productKey, {
          name: event.productName || "Unknown product",
          quantity: (product?.quantity || 0) + quantity,
          value: (product?.value || 0) + value,
        });
      }

      sessionMap.set(event.sessionId, entry);
    }

    const findInferredDraft = (entry: {
      latestActivity: Date;
      products: Map<string, { name: string }>;
    }) => {
      const cartProducts = new Set(Array.from(entry.products.values()).map((product) => productKey(product.name)).filter(Boolean));
      if (!cartProducts.size) return null;

      let bestDraft: (typeof draftRows)[number] | null = null;
      let bestScore = 0;

      for (const draft of draftRows) {
        const draftProducts = new Set(
          (draft.cartSnapshot || []).map((item) => productKey(item.name)).filter(Boolean),
        );
        if (!draftProducts.size) continue;

        const overlap = [...cartProducts].filter((product) => draftProducts.has(product)).length;
        if (!overlap) continue;

        const hoursApart = Math.abs(entry.latestActivity.getTime() - draft.updatedAt.getTime()) / (1000 * 60 * 60);
        if (hoursApart > 14 * 24) continue;

        const score = overlap * 100 - hoursApart;
        if (score > bestScore) {
          bestScore = score;
          bestDraft = draft;
        }
      }

      return bestDraft;
    };

    const sessionRows = Array.from(sessionMap.values())
      .filter((entry) => entry.addToCartCount > 0)
      .map((entry) => {
        const exactDraft = draftMap.get(entry.sessionId) || null;
        const inferredDraft = exactDraft ? null : findInferredDraft(entry);
        const draft = exactDraft || inferredDraft;
        const phoneKey = contactKey(draft?.phone);
        const emailKey = contactKey(draft?.email);
        const coupon =
          couponMap.get(entry.sessionId) ||
          (phoneKey ? couponContactMap.get(phoneKey) : null) ||
          (emailKey ? couponContactMap.get(emailKey) : null) ||
          null;
        const order =
          orderMap.get(entry.sessionId) ||
          (phoneKey ? orderContactMap.get(phoneKey) : null) ||
          (emailKey ? orderContactMap.get(emailKey) : null) ||
          null;
        const intelligence = intelligenceMap.get(entry.sessionId);
        const reward = rewardMap.get(entry.sessionId) || null;
        const couponPhone = coupon?.destination && !isEmail(coupon.destination) ? coupon.destination : null;
        const couponEmail = coupon?.destination && isEmail(coupon.destination) ? coupon.destination : null;
        const phone = draft?.phone || couponPhone;
        const email = draft?.email || couponEmail;
        const draftProducts = (draft?.cartSnapshot || [])
          .filter((item) => !item.isGift)
          .map((item) => ({
            name: item.name,
            quantity: item.quantity,
            value: item.price * item.quantity,
          }))
          .sort((a, b) => b.value - a.value);
        const checkoutValue = draft?.grandTotal ? money(draft.grandTotal) : null;
        const estimatedDiscountedCartValue =
          reward && entry.cartSignalValue > 0
            ? getDiscountedValue(entry.cartSignalValue, reward.percent)
            : null;
        const currentCartValue =
          checkoutValue && estimatedDiscountedCartValue
            ? Math.min(checkoutValue, estimatedDiscountedCartValue)
            : checkoutValue || estimatedDiscountedCartValue || entry.cartSignalValue;
        const discountAmount =
          reward && entry.cartSignalValue > currentCartValue
            ? entry.cartSignalValue - currentCartValue
            : null;
        const name = draft?.fullName || null;
        const hasContact = Boolean(phone || email);
        const hasCoupon = Boolean(coupon);
        const hasCheckout = Boolean(draft);
        const hasOrder = Boolean(order);
        const connectionSource: CartLeadRow["connectionSource"] = exactDraft
          ? "session"
          : inferredDraft
            ? "inferred"
            : coupon
              ? "contact"
              : null;
        const potentialScore = Math.min(
          100,
          Math.round(
            (entry.cartSignalValue >= 2000 ? 30 : entry.cartSignalValue >= 1000 ? 22 : 12) +
              (hasContact ? 25 : 0) +
              (hasCoupon ? 15 : 0) +
              (hasCheckout ? 20 : 0) +
              (intelligence?.intentScore ? Math.min(10, intelligence.intentScore / 10) : 0),
          ),
        );

        return {
          sessionId: entry.sessionId,
          anonymousJourneyKey:
            !phone && !email && entry.products.size > 0
              ? (() => {
                  const productKeys = Array.from(entry.products.values())
                    .map((product) => productKey(product.name))
                    .sort();
                  const productSignature = productKeys.join("|");
                  const isKitJourney = productKeys.some((key) => key.includes("custom 4 x 20ml kit"));
                  if (hasCheckout && isKitJourney) {
                    return `checkout-product::${productSignature}`;
                  }
                  if (entry.ipAddress && entry.userAgent) {
                    return `${entry.ipAddress}::${entry.userAgent.slice(0, 120)}::${productSignature}`;
                  }
                  return hasCheckout ? `checkout-product::${productSignature}` : null;
                })()
              : null,
          name,
          phone,
          normalizedPhone: normalizePhone(phone),
          email,
          latestActivity: entry.latestActivity.toISOString(),
          activityCount:
            entry.addToCartCount +
            entry.cartOpens +
            entry.removeCount +
            entry.quantityUpdates +
            entry.rewardBannerClicks,
          cartOpens: entry.cartOpens,
          addToCartCount: entry.addToCartCount,
          removeCount: entry.removeCount,
          quantityUpdates: entry.quantityUpdates,
          rewardBannerClicks: entry.rewardBannerClicks,
          cartSignalValue: currentCartValue,
          originalCartSignalValue: discountAmount ? entry.cartSignalValue : null,
          discountAmount,
          rewardCode: reward?.code || null,
          rewardLabel:
            reward?.label || (reward ? `Welcome Back ${reward.percent}` : null),
          rewardPercent: reward?.percent || null,
          rewardEvidence: Boolean(reward),
          products:
            draftProducts.length > 0
              ? draftProducts
              : Array.from(entry.products.values()).sort((a, b) => b.value - a.value),
          potentialScore,
          hasContact,
          hasCoupon,
          couponCode: coupon?.couponCode || null,
          couponChannel: coupon?.channel || null,
          couponDestination: coupon?.destination || null,
          hasCheckout,
          connectionSource,
          checkoutId: draft?.id || null,
          checkoutStatus: draft?.status || null,
          checkoutValue,
          checkoutLeadStatus: draft?.leadStatus || null,
          checkoutLastEditedField: draft?.lastEditedField || null,
          hasOrder,
          orderNumber: order?.orderNumber || null,
          orderStatus: order?.status || null,
          orderValue: order?.grandTotal ? money(order.grandTotal) : null,
          intentScore: intelligence?.intentScore ?? null,
          abandonmentRisk: intelligence?.abandonmentRisk ?? null,
          predictedNextAction: intelligence?.predictedNextAction || null,
        };
      })
      .filter((row) => !row.hasOrder);

    rows = mergeCartLeadRows(sessionRows)
      .sort((a, b) => b.potentialScore - a.potentialScore || new Date(b.latestActivity).getTime() - new Date(a.latestActivity).getTime());
  } catch (error) {
    console.error("Cart leads page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Cart Leads</h1>
        </div>
        <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">Cart lead data could not be loaded. Sync the schema, then refresh this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const connectedLeads = rows.filter((row) => row.hasCoupon || row.hasCheckout || row.hasContact).length;
  const checkoutStarted = rows.filter((row) => row.hasCheckout).length;
  const couponConnected = rows.filter((row) => row.hasCoupon).length;
  const totalCartValue = rows.reduce((sum, row) => sum + row.cartSignalValue, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
          <ShoppingCart className="h-5 w-5 text-white/65" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-white">Cart Leads</h1>
        </div>
        <AdminDateWindowControl />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Potential Cart Leads</p>
          <p className="mt-2 text-2xl font-semibold text-white">{rows.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/45">Connected Leads</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200">{connectedLeads}</p>
        </div>
        <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.04] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200/45">Coupon Connected</p>
          <p className="mt-2 text-2xl font-semibold text-blue-200">{couponConnected}</p>
        </div>
        <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/45">Cart Signal Value</p>
          <p className="mt-2 text-2xl font-semibold text-amber-200">{formatINR(totalCartValue)}</p>
          <p className="mt-1 text-xs text-white/30">{checkoutStarted} started checkout</p>
        </div>
      </div>

      <CartLeadsTable rows={rows} />
    </div>
  );
}
