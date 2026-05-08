import { db } from "@/db";
import { cartEvents, checkoutDrafts, couponCodeEvents, orders, sessionIntelligence } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ShoppingCart } from "lucide-react";
import { CartLeadsTable, type CartLeadRow } from "./CartLeadsTable";
import { formatINR } from "@/lib/currency";

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

export default async function CartLeadsPage() {
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
        createdAt: cartEvents.createdAt,
      })
      .from(cartEvents)
      .orderBy(desc(cartEvents.createdAt))
      .limit(1500);

    const [couponRows, draftRows, orderRows, intelligenceRows] = await Promise.all([
      db
        .select({
          sessionId: couponCodeEvents.sessionId,
          channel: couponCodeEvents.channel,
          couponCode: couponCodeEvents.couponCode,
          destination: couponCodeEvents.destination,
          createdAt: couponCodeEvents.createdAt,
        })
        .from(couponCodeEvents)
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
          updatedAt: checkoutDrafts.updatedAt,
        })
        .from(checkoutDrafts)
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
          createdAt: orders.createdAt,
        })
        .from(orders)
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
        .orderBy(desc(sessionIntelligence.updatedAt))
        .limit(1000),
    ]);

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

    const sessionMap = new Map<
      string,
      {
        sessionId: string;
        latestActivity: Date;
        cartOpens: number;
        addToCartCount: number;
        removeCount: number;
        quantityUpdates: number;
        cartSignalValue: number;
        products: Map<string, { name: string; quantity: number; value: number }>;
      }
    >();

    for (const event of cartRows) {
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
          cartSignalValue: 0,
          products: new Map<string, { name: string; quantity: number; value: number }>(),
        };

      if (event.createdAt > entry.latestActivity) entry.latestActivity = event.createdAt;
      if (event.eventType === "cart_open") entry.cartOpens += 1;
      if (event.eventType === "remove_from_cart") entry.removeCount += 1;
      if (event.eventType === "update_cart_quantity") entry.quantityUpdates += 1;

      if (event.eventType === "add_to_cart") {
        entry.addToCartCount += 1;
        const quantity = event.quantity || 1;
        const value = money(event.price) * quantity;
        entry.cartSignalValue += value;
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

    rows = Array.from(sessionMap.values())
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
        const couponPhone = coupon?.destination && !isEmail(coupon.destination) ? coupon.destination : null;
        const couponEmail = coupon?.destination && isEmail(coupon.destination) ? coupon.destination : null;
        const phone = draft?.phone || couponPhone;
        const email = draft?.email || couponEmail;
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
          name,
          phone,
          normalizedPhone: normalizePhone(phone),
          email,
          latestActivity: entry.latestActivity.toISOString(),
          cartOpens: entry.cartOpens,
          addToCartCount: entry.addToCartCount,
          removeCount: entry.removeCount,
          quantityUpdates: entry.quantityUpdates,
          cartSignalValue: entry.cartSignalValue,
          products: Array.from(entry.products.values()).sort((a, b) => b.value - a.value),
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
          checkoutValue: draft?.grandTotal ? money(draft.grandTotal) : null,
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
      .filter((row) => !row.hasOrder)
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
        <div>
          <h1 className="text-2xl font-semibold text-white">Cart Leads</h1>
          <p className="mt-1 text-sm text-white/45">
            Cart activity connected with coupon claims, checkout drafts, and customer contact data.
          </p>
        </div>
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
