import { db } from "@/db";
import { couponCodeEvents, checkoutDrafts, orders, sessionIntelligence } from "@/db/schema";
import { desc, gte, inArray } from "drizzle-orm";
import { CouponLeadsTable } from "./CouponLeadsTable";
import { Ticket } from "lucide-react";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string }> | { hours?: string };
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
  const timeWindow = parseAdminTimeWindow(params?.hours);
  let events: CouponEventRow[] = [];
  let dbError = false;

  try {
    events = await db
      .select()
      .from(couponCodeEvents)
      .where(gte(couponCodeEvents.createdAt, timeWindow.since))
      .orderBy(desc(couponCodeEvents.createdAt))
      .limit(500);
    events = filterExcludedAdminRows(events, collectExcludedSessionIds(events));
  } catch (error) {
    console.error("Coupon leads page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl text-white tracking-tight">Coupon Leads</h1>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl text-white tracking-tight">Coupon Leads</h1>
        </div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] ml-11">
          People who claimed your coupon codes — cross-referenced with their full journey
        </p>
        <p className="ml-11 text-xs text-white/35">Showing coupon leads from {timeWindow.label.toLowerCase()}.</p>
        </div>
        <AdminDateWindowControl />
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

      <CouponLeadsTable events={enrichedEvents} />
    </div>
  );
}
