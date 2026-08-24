import { db } from "@/db";
import { couponCodeEvents, coupons, checkoutDrafts, orders, sessionIntelligence } from "@/db/schema";
import { and, desc, gte, inArray, lte } from "drizzle-orm";
import { CouponLeadsTable } from "./CouponLeadsTable";
import { CouponManagement } from "./CouponManagement";
import { Ticket } from "lucide-react";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { parseAdminMarket, isIndiaLeadSignal, isIndiaCheckoutSignal } from "@/lib/admin-market";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string; market?: string; from?: string; to?: string }>;
};

type CouponEventRow = typeof couponCodeEvents.$inferSelect;

function getLeadKey(event: CouponEventRow) {
  const destination =
    event.destination?.trim().toLowerCase() ||
    event.sessionId?.trim().toLowerCase() ||
    event.id;
  const couponCode = event.couponCode?.trim().toUpperCase() || "NO_CODE";
  return `${event.channel}:${couponCode}:${destination}`;
}

function dedupeCouponLeadEvents(events: CouponEventRow[]) {
  const byLead = new Map<string, CouponEventRow>();

  for (const event of events) {
    const key = getLeadKey(event);
    const existing = byLead.get(key);

    if (!existing || (existing.eventType !== "sent" && event.eventType === "sent")) {
      byLead.set(key, event);
    }
  }

  return Array.from(byLead.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export default async function CouponLeadsPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours, params?.from, params?.to);
  const market = parseAdminMarket(params?.market);
  let events: CouponEventRow[] = [];
  let couponRows: Array<typeof coupons.$inferSelect> = [];
  let couponOrders: Array<typeof orders.$inferSelect> = [];
  let dbError = false;

  try {
    [events, couponRows, couponOrders] = await Promise.all([
      db.select().from(couponCodeEvents).where(and(gte(couponCodeEvents.createdAt, timeWindow.since), lte(couponCodeEvents.createdAt, timeWindow.until))).orderBy(desc(couponCodeEvents.createdAt)).limit(500),
      db.select().from(coupons).orderBy(desc(coupons.updatedAt)),
      db.select().from(orders).where(and(gte(orders.createdAt, timeWindow.since), lte(orders.createdAt, timeWindow.until))).orderBy(desc(orders.createdAt)).limit(1000),
    ]);
    events = filterExcludedAdminRows(events, collectExcludedSessionIds(events));
    couponOrders = filterExcludedAdminRows(couponOrders, collectExcludedSessionIds(couponOrders));

    if (market === "india") {
      events = events.filter((row) => isIndiaLeadSignal(row));
    } else if (market === "out_of_india") {
      events = events.filter((row) => !isIndiaLeadSignal(row));
    }
    if (market === "india") couponOrders = couponOrders.filter(isIndiaCheckoutSignal);
    else if (market === "out_of_india") couponOrders = couponOrders.filter((row) => !isIndiaCheckoutSignal(row));
  } catch (error) {
    console.error("Coupon leads page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
        <div className="admin-page-intro-copy flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl text-white tracking-tight">Coupons</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">
              Run <code className="bg-white/10 px-2 py-1 rounded text-xs">npm run db:push</code> to sync.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Cross-reference: gather session IDs and fetch related data ──
  events = dedupeCouponLeadEvents(events);
  const sessionIds = [...new Set(events.map((e) => e.sessionId).filter(Boolean))] as string[];
  const draftsMap = new Map<string, { status: string; fullName: string | null; phone: string | null; email: string | null; grandTotal: string | null; leadStatus: string }>();
  const ordersMap = new Map<string, { orderNumber: string; status: string; grandTotal: string | null }>();
  const intentMap = new Map<string, { intentScore: number; abandonmentRisk: number; predictedNextAction: string | null; lastActiveAt: Date | null }>();

  if (sessionIds.length > 0) {
    try {
      let [relatedDrafts, relatedOrders, relatedIntel] = await Promise.all([
        db.select({
          sessionId: checkoutDrafts.sessionId,
          status: checkoutDrafts.status,
          fullName: checkoutDrafts.fullName,
          phone: checkoutDrafts.phone,
          email: checkoutDrafts.email,
          grandTotal: checkoutDrafts.grandTotal,
          leadStatus: checkoutDrafts.leadStatus,
          ipAddress: checkoutDrafts.ipAddress,
          userAgent: checkoutDrafts.userAgent,
        }).from(checkoutDrafts).where(inArray(checkoutDrafts.sessionId, sessionIds)),
        db.select({
          sessionId: orders.sessionId,
          orderNumber: orders.orderNumber,
          status: orders.status,
          grandTotal: orders.grandTotal,
          phone: orders.phone,
          email: orders.email,
          ipAddress: orders.ipAddress,
          userAgent: orders.userAgent,
        }).from(orders).where(inArray(orders.sessionId, sessionIds)),
        db.select({
          sessionId: sessionIntelligence.sessionId,
          intentScore: sessionIntelligence.intentScore,
          abandonmentRisk: sessionIntelligence.abandonmentRisk,
          predictedNextAction: sessionIntelligence.predictedNextAction,
          lastActiveAt: sessionIntelligence.lastActiveAt,
        }).from(sessionIntelligence).where(inArray(sessionIntelligence.sessionId, sessionIds)),
      ]);

      const excludedSessionIds = collectExcludedSessionIds(relatedDrafts, relatedOrders);
      events = filterExcludedAdminRows(events, excludedSessionIds);
      relatedDrafts = filterExcludedAdminRows(relatedDrafts, excludedSessionIds);
      relatedOrders = filterExcludedAdminRows(relatedOrders, excludedSessionIds);
      relatedIntel = relatedIntel.filter((row) => !excludedSessionIds.has(row.sessionId));

      if (market === "india") {
        events = events.filter((row) => isIndiaLeadSignal(row));
        relatedDrafts = relatedDrafts.filter(isIndiaCheckoutSignal);
        relatedOrders = relatedOrders.filter(isIndiaCheckoutSignal);
      } else if (market === "out_of_india") {
        events = events.filter((row) => !isIndiaLeadSignal(row));
        relatedDrafts = relatedDrafts.filter((row) => !isIndiaCheckoutSignal(row));
        relatedOrders = relatedOrders.filter((row) => !isIndiaCheckoutSignal(row));
      }

      for (const d of relatedDrafts) {
        draftsMap.set(d.sessionId, d);
      }
      for (const o of relatedOrders) {
        ordersMap.set(o.sessionId, o);
      }
      for (const i of relatedIntel) {
        intentMap.set(i.sessionId, i);
      }
    } catch (err) {
      console.error("Cross-reference query failed (non-fatal):", err);
    }
  }

  // Build enriched events
  const enrichedEvents = events.map((e) => {
    const draft = e.sessionId ? draftsMap.get(e.sessionId) : null;
    const order = e.sessionId ? ordersMap.get(e.sessionId) : null;
    const intel = e.sessionId ? intentMap.get(e.sessionId) : null;

    return {
      ...e,
      // Cross-referenced data
      xref: {
        hasCheckout: !!draft,
        checkoutStatus: draft?.status || null,
        checkoutName: draft?.fullName || null,
        checkoutPhone: draft?.phone || null,
        checkoutEmail: draft?.email || null,
        checkoutValue: draft?.grandTotal ? parseFloat(draft.grandTotal) : null,
        leadStatus: draft?.leadStatus || null,
        hasOrder: !!order,
        orderNumber: order?.orderNumber || null,
        orderStatus: order?.status || null,
        orderValue: order?.grandTotal ? parseFloat(order.grandTotal) : null,
        intentScore: intel?.intentScore ?? null,
        abandonmentRisk: intel?.abandonmentRisk ?? null,
        predictedAction: intel?.predictedNextAction || null,
        lastActiveAt: intel?.lastActiveAt?.toISOString() || null,
      },
    };
  });

  const totalClaims = events.length;
  const emailClaims = events.filter((e) => e.channel === "email").length;
  const whatsappClaims = events.filter((e) => e.channel === "whatsapp").length;
  const uniqueDestinations = new Set(events.map((e) => e.destination).filter(Boolean)).size;
  const convertedToOrder = enrichedEvents.filter((e) => e.xref.hasOrder).length;
  const startedCheckout = enrichedEvents.filter((e) => e.xref.hasCheckout).length;

  const couponManagementRows = couponRows.map((coupon) => {
    const code = coupon.code.trim().toUpperCase();
    const claims = enrichedEvents.filter((event) => event.couponCode?.trim().toUpperCase() === code);
    const redemptions = couponOrders.filter((order) =>
      (order.appliedCouponCode || "").split(",").map((value) => value.trim().toUpperCase()).includes(code),
    );
    const uniqueClaimants = new Set(claims.map((event) => event.destination?.trim().toLowerCase() || event.sessionId).filter(Boolean)).size;
    const discountGranted = redemptions.reduce((sum, order) => sum + Math.max(0, Number(order.subtotal || 0) + Number(order.shippingFee || 0) - Number(order.grandTotal || 0)), 0);
    return {
      ...coupon,
      createdAt: coupon.createdAt.toISOString(), updatedAt: coupon.updatedAt.toISOString(), archivedAt: coupon.archivedAt?.toISOString() || null,
      metrics: {
        claims: claims.length, uniqueClaimants,
        emailClaims: claims.filter((event) => event.channel === "email").length,
        whatsappClaims: claims.filter((event) => event.channel === "whatsapp").length,
        checkoutStarts: claims.filter((event) => event.xref.hasCheckout).length,
        redemptions: redemptions.length,
        conversionRate: uniqueClaimants ? Math.round((redemptions.length / uniqueClaimants) * 1000) / 10 : 0,
        discountGranted,
        revenue: redemptions.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0),
      },
      claimants: claims.slice(0, 20).map((event) => ({ id: event.id, destination: event.destination, channel: event.channel, createdAt: event.createdAt.toISOString(), hasCheckout: event.xref.hasCheckout, hasOrder: event.xref.hasOrder })),
      redeemedOrders: redemptions.slice(0, 20).map((order) => ({ id: order.id, orderNumber: order.orderNumber, fullName: order.fullName, grandTotal: Number(order.grandTotal || 0), status: order.status, createdAt: order.createdAt.toISOString() })),
    };
  });

  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
      <div className="admin-page-intro-copy flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl text-white tracking-tight">Coupons</h1>
        </div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] ml-11">
          People who claimed your coupon codes — cross-referenced with their full journey
        </p>
        <p className="ml-11 text-xs text-white/35">Showing coupon leads from {timeWindow.label.toLowerCase()}.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Total Claims</p>
          <p className="text-2xl text-white mt-2">{totalClaims}</p>
        </div>
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Via Email</p>
          <p className="text-2xl text-white mt-2">{emailClaims}</p>
        </div>
        <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/50 font-bold">Via WhatsApp</p>
          <p className="text-2xl text-emerald-300 mt-2">{whatsappClaims}</p>
        </div>
        <div className="rounded-3xl border border-primary/15 bg-primary/[0.03] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50 font-bold">Unique People</p>
          <p className="text-2xl text-primary mt-2">{uniqueDestinations}</p>
        </div>
        <div className="rounded-3xl border border-amber-500/15 bg-amber-500/[0.03] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/50 font-bold">Started Checkout</p>
          <p className="text-2xl text-amber-300 mt-2">{startedCheckout}</p>
        </div>
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/50 font-bold">Converted to Order</p>
          <p className="text-2xl text-emerald-300 mt-2">{convertedToOrder}</p>
        </div>
      </div>

      <CouponManagement initialCoupons={couponManagementRows} />

      <CouponLeadsTable events={enrichedEvents} />
    </div>
  );
}
