import { db } from "@/db";
import {
  sessionIntelligence,
  sectionAttribution,
  couponCodeEvents,
  checkoutDrafts,
  orders,
  cartEvents,
  consentEvents,
} from "@/db/schema";
import { desc, inArray } from "drizzle-orm";
import { IntelligenceFeed } from "./IntelligenceFeed";
import { SectionPerformance } from "./SectionPerformance";
import { Brain, Zap, AlertTriangle, Target, ShoppingCart, Ticket, Package } from "lucide-react";
import {
  isIndiaCheckoutSignal,
  isIndiaLeadSignal,
  isIndiaMarket,
  isIndiaOperationalCountry,
  isIndiaTimezone,
  parseAdminMarket,
} from "@/lib/admin-market";

export const revalidate = 0;

type AdminPageProps = {
  searchParams?: Promise<{ market?: string }> | { market?: string };
};

type EnrichedSession = Record<string, unknown> & {
  xref: {
    contactPhone: string | null;
    contactEmail: string | null;
    hasOrder: boolean;
    [key: string]: unknown;
  };
};

function dataCountry(data: Record<string, unknown> | null | undefined) {
  const country = data?.country;
  return typeof country === "string" ? country : null;
}

export default async function IntelligencePage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const market = parseAdminMarket(params?.market);
  const indiaOnly = isIndiaMarket(market);
  let sessions: (typeof sessionIntelligence.$inferSelect)[] = [];
  let sections: (typeof sectionAttribution.$inferSelect)[] = [];
  let dbError = false;

  try {
    [sessions, sections] = await Promise.all([
      db.select().from(sessionIntelligence).orderBy(desc(sessionIntelligence.updatedAt)).limit(100),
      db.select().from(sectionAttribution).orderBy(desc(sectionAttribution.attributionScore)).limit(10),
    ]);
  } catch (error) {
    console.error("Intelligence page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl text-white tracking-tight">Behavioral Intelligence</h1>
          </div>
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

  // Cross-reference for summary stats
  const sessionIds = sessions.map((s) => s.sessionId).filter(Boolean);

  let couponCount = 0;
  let checkoutCount = 0;
  let orderCount = 0;
  let enrichedSessions: EnrichedSession[] = [];
  let visibleSessions = sessions;

  try {
    if (sessionIds.length > 0) {
      const [coupons, drafts, allOrders, carts, consents] = await Promise.all([
        db.select({
          sessionId: couponCodeEvents.sessionId,
          couponCode: couponCodeEvents.couponCode,
          channel: couponCodeEvents.channel,
          destination: couponCodeEvents.destination,
          country: couponCodeEvents.country,
          createdAt: couponCodeEvents.createdAt,
        }).from(couponCodeEvents).where(inArray(couponCodeEvents.sessionId, sessionIds)),
        db.select({
          sessionId: checkoutDrafts.sessionId,
          status: checkoutDrafts.status,
          fullName: checkoutDrafts.fullName,
          phone: checkoutDrafts.phone,
          email: checkoutDrafts.email,
          grandTotal: checkoutDrafts.grandTotal,
          leadStatus: checkoutDrafts.leadStatus,
          lastEditedField: checkoutDrafts.lastEditedField,
          cartSnapshot: checkoutDrafts.cartSnapshot,
          country: checkoutDrafts.country,
          pincode: checkoutDrafts.pincode,
          state: checkoutDrafts.state,
          updatedAt: checkoutDrafts.updatedAt,
        }).from(checkoutDrafts).where(inArray(checkoutDrafts.sessionId, sessionIds)),
        db.select({
          sessionId: orders.sessionId,
          orderNumber: orders.orderNumber,
          status: orders.status,
          grandTotal: orders.grandTotal,
          country: orders.country,
          pincode: orders.pincode,
          state: orders.state,
          createdAt: orders.createdAt,
        }).from(orders).where(inArray(orders.sessionId, sessionIds)),
        db.select({
          sessionId: cartEvents.sessionId,
          eventType: cartEvents.eventType,
          productName: cartEvents.productName,
          country: cartEvents.country,
          createdAt: cartEvents.createdAt,
        }).from(cartEvents).where(inArray(cartEvents.sessionId, sessionIds)).orderBy(desc(cartEvents.createdAt)).limit(500),
        db.select({
          sessionId: consentEvents.sessionId,
          timezone: consentEvents.timezone,
          data: consentEvents.data,
        }).from(consentEvents).where(inArray(consentEvents.sessionId, sessionIds)),
      ]);

      const indiaSessionIds = new Set<string>();
      if (indiaOnly) {
        for (const c of coupons) if (c.sessionId && isIndiaLeadSignal(c)) indiaSessionIds.add(c.sessionId);
        for (const d of drafts) if (isIndiaCheckoutSignal(d)) indiaSessionIds.add(d.sessionId);
        for (const o of allOrders) if (isIndiaCheckoutSignal(o)) indiaSessionIds.add(o.sessionId);
        for (const c of carts) if (isIndiaOperationalCountry(c.country)) indiaSessionIds.add(c.sessionId);
        for (const c of consents) {
          if (isIndiaTimezone(c.timezone) || isIndiaOperationalCountry(dataCountry(c.data))) {
            indiaSessionIds.add(c.sessionId);
          }
        }
      }

      visibleSessions = indiaOnly ? sessions.filter((session) => indiaSessionIds.has(session.sessionId)) : sessions;

      const couponMap = new Map<string, typeof coupons[0]>();
      for (const c of coupons) { if (c.sessionId) couponMap.set(c.sessionId, c); }
      const draftMap = new Map<string, typeof drafts[0]>();
      for (const d of drafts) { draftMap.set(d.sessionId, d); }
      const orderMap = new Map<string, typeof allOrders[0]>();
      for (const o of allOrders) { orderMap.set(o.sessionId, o); }
      const cartMap = new Map<string, { addedProducts: string[]; cartOpens: number }>();
      for (const c of carts) {
        let entry = cartMap.get(c.sessionId);
        if (!entry) { entry = { addedProducts: [], cartOpens: 0 }; cartMap.set(c.sessionId, entry); }
        if (c.eventType === "add_to_cart" && c.productName && !entry.addedProducts.includes(c.productName)) entry.addedProducts.push(c.productName);
        if (c.eventType === "cart_open") entry.cartOpens++;
      }

      couponCount = visibleSessions.filter((session) => couponMap.has(session.sessionId)).length;
      checkoutCount = visibleSessions.filter((session) => draftMap.has(session.sessionId)).length;
      orderCount = visibleSessions.filter((session) => orderMap.has(session.sessionId)).length;

      enrichedSessions = visibleSessions.map((session) => {
        const coupon = couponMap.get(session.sessionId);
        const draft = draftMap.get(session.sessionId);
        const order = orderMap.get(session.sessionId);
        const cart = cartMap.get(session.sessionId);

        const contactName = draft?.fullName || null;
        const contactPhone = draft?.phone || (coupon?.channel === "whatsapp" ? coupon.destination : null);
        const contactEmail = draft?.email || (coupon?.channel === "email" ? coupon.destination : null);

        let journeyStage = "visitor";
        if (order) journeyStage = "ordered";
        else if (draft?.leadStatus === "contacted" || draft?.leadStatus === "replied") journeyStage = "contacted";
        else if (draft) journeyStage = "checkout_started";
        else if (cart && cart.addedProducts.length > 0) journeyStage = "cart_active";
        else if (coupon) journeyStage = "coupon_claimed";

        return {
          ...session,
          lastActiveAt: session.lastActiveAt?.toISOString() || session.updatedAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          createdAt: session.createdAt.toISOString(),
          xref: {
            contactName,
            contactPhone,
            contactEmail,
            journeyStage,
            couponClaimed: !!coupon,
            couponCode: coupon?.couponCode || null,
            couponChannel: coupon?.channel || null,
            couponDestination: coupon?.destination || null,
            addedProducts: cart?.addedProducts || [],
            cartOpens: cart?.cartOpens || 0,
            hasCheckout: !!draft,
            checkoutStatus: draft?.status || null,
            checkoutValue: draft?.grandTotal ? parseFloat(draft.grandTotal) : null,
            leadStatus: draft?.leadStatus || null,
            lastEditedField: draft?.lastEditedField || null,
            cartItemCount: Array.isArray(draft?.cartSnapshot) ? draft.cartSnapshot.length : 0,
            hasOrder: !!order,
            orderNumber: order?.orderNumber || null,
            orderStatus: order?.status || null,
            orderValue: order?.grandTotal ? parseFloat(order.grandTotal) : null,
          },
        };
      });
    } else {
      visibleSessions = indiaOnly ? [] : sessions;
      enrichedSessions = visibleSessions.map((s) => ({
        ...s,
        lastActiveAt: s.lastActiveAt?.toISOString() || s.updatedAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        xref: {
          contactName: null, contactPhone: null, contactEmail: null,
          journeyStage: "visitor",
          couponClaimed: false, couponCode: null, couponChannel: null, couponDestination: null,
          addedProducts: [], cartOpens: 0,
          hasCheckout: false, checkoutStatus: null, checkoutValue: null,
          leadStatus: null, lastEditedField: null, cartItemCount: 0,
          hasOrder: false, orderNumber: null, orderStatus: null, orderValue: null,
        },
      }));
    }
  } catch (err) {
    console.error("Intelligence cross-reference error (non-fatal):", err);
    visibleSessions = indiaOnly ? [] : sessions;
    enrichedSessions = visibleSessions.map((s) => ({
      ...s,
      lastActiveAt: s.lastActiveAt?.toISOString() || s.updatedAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      xref: {
        contactName: null, contactPhone: null, contactEmail: null,
        journeyStage: "visitor",
        couponClaimed: false, couponCode: null, couponChannel: null, couponDestination: null,
        addedProducts: [], cartOpens: 0,
        hasCheckout: false, checkoutStatus: null, checkoutValue: null,
        leadStatus: null, lastEditedField: null, cartItemCount: 0,
        hasOrder: false, orderNumber: null, orderStatus: null, orderValue: null,
      },
    }));
  }

  const highIntentCount = visibleSessions.filter(s => s.intentScore > 70).length;
  const highRiskCount = visibleSessions.filter(s => s.abandonmentRisk > 60).length;
  const contactableNotOrdered = enrichedSessions.filter((s) =>
    (s.xref.contactPhone || s.xref.contactEmail) && !s.xref.hasOrder
  ).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl text-white tracking-tight">Behavioral Intelligence</h1>
        </div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] ml-11">
          Real-time intent scoring • Full customer journey • Cross-referenced data
        </p>
        <p className="ml-11 text-xs text-white/35">
          Market: {market === "india" ? "India" : "All markets"}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Sessions</p>
          </div>
          <p className="text-2xl text-white">{visibleSessions.length}</p>
        </div>

        <div className="rounded-3xl border border-amber-500/15 bg-amber-500/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/50 font-bold">Hot Leads</p>
            <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <p className="text-2xl text-amber-300">{highIntentCount}</p>
          <p className="mt-1 text-[9px] text-white/15 uppercase tracking-widest">Intent &gt; 70%</p>
        </div>

        <div className="rounded-3xl border border-red-500/15 bg-red-500/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-red-400/50 font-bold">At Risk</p>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl text-red-300">{highRiskCount}</p>
          <p className="mt-1 text-[9px] text-white/15 uppercase tracking-widest">Exit intent</p>
        </div>

        <div className="rounded-3xl border border-purple-500/15 bg-purple-500/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400/50 font-bold">Coupons</p>
            <Ticket className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl text-purple-300">{couponCount}</p>
          <p className="mt-1 text-[9px] text-white/15 uppercase tracking-widest">Claimed</p>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-primary/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50 font-bold">Checkouts</p>
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl text-primary">{checkoutCount}</p>
          <p className="mt-1 text-[9px] text-white/15 uppercase tracking-widest">Started</p>
        </div>

        <div className="rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/50 font-bold">Orders</p>
            <Package className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl text-emerald-300">{orderCount}</p>
          <p className="mt-1 text-[9px] text-white/15 uppercase tracking-widest">Converted</p>
        </div>

        <div className="rounded-3xl border border-blue-500/15 bg-blue-500/[0.03] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400/50 font-bold">To Contact</p>
            <Target className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl text-blue-300">{contactableNotOrdered}</p>
          <p className="mt-1 text-[9px] text-white/15 uppercase tracking-widest">Have info, no order</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-white px-2">Customer Journey Feed</h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Live Syncing</span>
            </div>
          </div>
          {/* @ts-expect-error - enriched sessions have serialized dates */}
          <IntelligenceFeed initialSessions={enrichedSessions} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl text-white px-2">Section Attribution</h2>
          <SectionPerformance sections={sections} />
        </div>
      </div>
    </div>
  );
}
