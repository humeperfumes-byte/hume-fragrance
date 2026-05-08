import { NextRequest, NextResponse } from "next/server";
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
import { requireAdminToken } from "@/lib/admin-auth";
import {
  isIndiaCheckoutSignal,
  isIndiaLeadSignal,
  isIndiaMarket,
  isIndiaOperationalCountry,
  isIndiaTimezone,
  parseAdminMarket,
} from "@/lib/admin-market";

export const dynamic = "force-dynamic";

function dataCountry(data: Record<string, unknown> | null | undefined) {
  const country = data?.country;
  return typeof country === "string" ? country : null;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const market = parseAdminMarket(searchParams.get("market"));
    const indiaOnly = isIndiaMarket(market);

    // Core intelligence data
    const [sessions, sections] = await Promise.all([
      db
        .select()
        .from(sessionIntelligence)
        .orderBy(desc(sessionIntelligence.updatedAt))
        .limit(100),
      db
        .select()
        .from(sectionAttribution)
        .orderBy(desc(sectionAttribution.attributionScore))
        .limit(10),
    ]);

    // Gather all session IDs for cross-referencing
    const sessionIds = sessions.map((s) => s.sessionId).filter(Boolean);

    if (sessionIds.length === 0) {
      return NextResponse.json({ sessions: [], sections, enriched: [], market });
    }

    // Cross-reference with coupon claims, checkouts, orders, cart events
    const [coupons, drafts, allOrders, carts, consents] = await Promise.all([
      db
        .select({
          sessionId: couponCodeEvents.sessionId,
          couponCode: couponCodeEvents.couponCode,
          channel: couponCodeEvents.channel,
          destination: couponCodeEvents.destination,
          country: couponCodeEvents.country,
          createdAt: couponCodeEvents.createdAt,
        })
        .from(couponCodeEvents)
        .where(inArray(couponCodeEvents.sessionId, sessionIds)),
      db
        .select({
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
        })
        .from(checkoutDrafts)
        .where(inArray(checkoutDrafts.sessionId, sessionIds)),
      db
        .select({
          sessionId: orders.sessionId,
          orderNumber: orders.orderNumber,
          status: orders.status,
          grandTotal: orders.grandTotal,
          country: orders.country,
          pincode: orders.pincode,
          state: orders.state,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(inArray(orders.sessionId, sessionIds)),
      db
        .select({
          sessionId: cartEvents.sessionId,
          eventType: cartEvents.eventType,
          productName: cartEvents.productName,
          country: cartEvents.country,
          createdAt: cartEvents.createdAt,
        })
        .from(cartEvents)
        .where(inArray(cartEvents.sessionId, sessionIds))
        .orderBy(desc(cartEvents.createdAt))
        .limit(500),
      db
        .select({
          sessionId: consentEvents.sessionId,
          timezone: consentEvents.timezone,
          data: consentEvents.data,
        })
        .from(consentEvents)
        .where(inArray(consentEvents.sessionId, sessionIds)),
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

    const visibleSessions = indiaOnly ? sessions.filter((session) => indiaSessionIds.has(session.sessionId)) : sessions;

    // Build lookup maps
    const couponMap = new Map<string, typeof coupons[0]>();
    for (const c of coupons) {
      if (c.sessionId) couponMap.set(c.sessionId, c);
    }

    const draftMap = new Map<string, typeof drafts[0]>();
    for (const d of drafts) {
      draftMap.set(d.sessionId, d);
    }

    const orderMap = new Map<string, typeof allOrders[0]>();
    for (const o of allOrders) {
      orderMap.set(o.sessionId, o);
    }

    // Cart: group by session, get latest product interactions
    const cartMap = new Map<string, { addedProducts: string[]; cartOpens: number }>();
    for (const c of carts) {
      let entry = cartMap.get(c.sessionId);
      if (!entry) {
        entry = { addedProducts: [], cartOpens: 0 };
        cartMap.set(c.sessionId, entry);
      }
      if (c.eventType === "add_to_cart" && c.productName && !entry.addedProducts.includes(c.productName)) {
        entry.addedProducts.push(c.productName);
      }
      if (c.eventType === "cart_open") entry.cartOpens++;
    }

    // Build enriched sessions
    const enriched = visibleSessions.map((session) => {
      const coupon = couponMap.get(session.sessionId);
      const draft = draftMap.get(session.sessionId);
      const order = orderMap.get(session.sessionId);
      const cart = cartMap.get(session.sessionId);

      // Determine the best contact info available
      const contactName = draft?.fullName || null;
      const contactPhone = draft?.phone || (coupon?.channel === "whatsapp" ? coupon.destination : null);
      const contactEmail = draft?.email || (coupon?.channel === "email" ? coupon.destination : null);

      // Journey stage
      let journeyStage: "visitor" | "coupon_claimed" | "cart_active" | "checkout_started" | "contacted" | "ordered" = "visitor";
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
        // Cross-referenced data
        xref: {
          contactName,
          contactPhone,
          contactEmail,
          journeyStage,
          // Coupon
          couponClaimed: !!coupon,
          couponCode: coupon?.couponCode || null,
          couponChannel: coupon?.channel || null,
          couponDestination: coupon?.destination || null,
          // Cart
          addedProducts: cart?.addedProducts || [],
          cartOpens: cart?.cartOpens || 0,
          // Checkout
          hasCheckout: !!draft,
          checkoutStatus: draft?.status || null,
          checkoutValue: draft?.grandTotal ? parseFloat(draft.grandTotal) : null,
          leadStatus: draft?.leadStatus || null,
          lastEditedField: draft?.lastEditedField || null,
          cartItemCount: Array.isArray(draft?.cartSnapshot) ? draft.cartSnapshot.length : 0,
          // Order
          hasOrder: !!order,
          orderNumber: order?.orderNumber || null,
          orderStatus: order?.status || null,
          orderValue: order?.grandTotal ? parseFloat(order.grandTotal) : null,
        },
      };
    });

    return NextResponse.json({ sessions: enriched, sections, market });
  } catch (error) {
    console.error("Intelligence API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
