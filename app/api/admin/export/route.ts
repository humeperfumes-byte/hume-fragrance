import { NextRequest, NextResponse } from "next/server";
import { desc, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  couponCodeEvents,
  checkoutDrafts,
  orders,
  cartEvents,
  consentEvents,
  behavioralEvents,
  sessionIntelligence,
  sectionAttribution,
  razorpayWebhookEvents,
  emailEvents,
  products,
  reviews,
} from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

// ── CSV helper ──────────────────────────────────────────────
function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    // Escape quotes and wrap if contains comma/newline/quote
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

// ── Flatten nested objects for CSV ──────────────────────────
function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}_${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      Object.assign(result, flatten(val as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

async function getRazorpayWebhookEvents(since: Date) {
  try {
    return await db
      .select()
      .from(razorpayWebhookEvents)
      .where(gte(razorpayWebhookEvents.receivedAt, since))
      .orderBy(desc(razorpayWebhookEvents.receivedAt))
      .limit(10000);
  } catch (error) {
    console.warn("Razorpay webhook event export skipped. Sync the database schema.", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(90, Math.max(1, Number(searchParams.get("days") || "30")));
    const format = searchParams.get("format") || "json"; // json | csv
    const table = searchParams.get("table") || "all"; // all | journeys | specific table name
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ── Fetch all data ────────────────────────────────────
    const [
      couponEvents,
      drafts,
      allOrders,
      carts,
      consents,
      behaviors,
      intelligence,
      sections,
      razorpayEvents,
      emails,
      allProducts,
      allReviews,
    ] = await Promise.all([
      db.select().from(couponCodeEvents).where(gte(couponCodeEvents.createdAt, since)).orderBy(desc(couponCodeEvents.createdAt)).limit(10000),
      db.select().from(checkoutDrafts).where(gte(checkoutDrafts.updatedAt, since)).orderBy(desc(checkoutDrafts.updatedAt)).limit(10000),
      db.select().from(orders).where(gte(orders.createdAt, since)).orderBy(desc(orders.createdAt)).limit(10000),
      db.select().from(cartEvents).where(gte(cartEvents.createdAt, since)).orderBy(desc(cartEvents.createdAt)).limit(10000),
      db.select().from(consentEvents).where(gte(consentEvents.createdAt, since)).orderBy(desc(consentEvents.createdAt)).limit(10000),
      db.select().from(behavioralEvents).where(gte(behavioralEvents.createdAt, since)).orderBy(desc(behavioralEvents.createdAt)).limit(10000),
      db.select().from(sessionIntelligence).orderBy(desc(sessionIntelligence.updatedAt)).limit(10000),
      db.select().from(sectionAttribution).orderBy(desc(sectionAttribution.attributionScore)).limit(1000),
      getRazorpayWebhookEvents(since),
      db.select().from(emailEvents).where(gte(emailEvents.createdAt, since)).orderBy(desc(emailEvents.createdAt)).limit(10000),
      db.select().from(products).orderBy(desc(products.createdAt)),
      db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(5000),
    ]);

    // ── Build cross-referenced customer journeys ──────────
    const sessionMap = new Map<string, {
      sessionId: string;
      // Coupon data
      couponClaimed: boolean;
      couponCode: string | null;
      couponChannel: string | null;
      couponDestination: string | null;
      couponClaimedAt: string | null;
      // Checkout data
      hasCheckoutDraft: boolean;
      checkoutStatus: string | null;
      checkoutFullName: string | null;
      checkoutPhone: string | null;
      checkoutEmail: string | null;
      checkoutGrandTotal: number | null;
      checkoutCartItems: number;
      checkoutLeadStatus: string | null;
      lastEditedField: string | null;
      // Order data
      hasOrder: boolean;
      orderNumber: string | null;
      orderStatus: string | null;
      orderGrandTotal: number | null;
      orderCreatedAt: string | null;
      // Behavioral data
      intentScore: number | null;
      abandonmentRisk: number | null;
      predictedNextAction: string | null;
      topAbandonmentCause: string | null;
      totalInteractions: number | null;
      currentSection: string | null;
      // Cart data
      cartOpens: number;
      addToCartCount: number;
      removeFromCartCount: number;
      // Acquisition
      acquisitionSource: string | null;
      acquisitionCategory: string | null;
      utmSource: string | null;
      utmMedium: string | null;
      utmCampaign: string | null;
      // Pages visited
      pagesVisited: number;
      country: string | null;
      firstSeenAt: string | null;
      lastActiveAt: string | null;
    }>();

    function getSession(sessionId: string) {
      if (!sessionId) return null;
      const existing = sessionMap.get(sessionId);
      if (existing) return existing;
      const entry = {
        sessionId,
        couponClaimed: false,
        couponCode: null as string | null,
        couponChannel: null as string | null,
        couponDestination: null as string | null,
        couponClaimedAt: null as string | null,
        hasCheckoutDraft: false,
        checkoutStatus: null as string | null,
        checkoutFullName: null as string | null,
        checkoutPhone: null as string | null,
        checkoutEmail: null as string | null,
        checkoutGrandTotal: null as number | null,
        checkoutCartItems: 0,
        checkoutLeadStatus: null as string | null,
        lastEditedField: null as string | null,
        hasOrder: false,
        orderNumber: null as string | null,
        orderStatus: null as string | null,
        orderGrandTotal: null as number | null,
        orderCreatedAt: null as string | null,
        intentScore: null as number | null,
        abandonmentRisk: null as number | null,
        predictedNextAction: null as string | null,
        topAbandonmentCause: null as string | null,
        totalInteractions: null as number | null,
        currentSection: null as string | null,
        cartOpens: 0,
        addToCartCount: 0,
        removeFromCartCount: 0,
        acquisitionSource: null as string | null,
        acquisitionCategory: null as string | null,
        utmSource: null as string | null,
        utmMedium: null as string | null,
        utmCampaign: null as string | null,
        pagesVisited: 0,
        country: null as string | null,
        firstSeenAt: null as string | null,
        lastActiveAt: null as string | null,
      };
      sessionMap.set(sessionId, entry);
      return entry;
    }

    // Merge coupon events
    for (const evt of couponEvents) {
      if (!evt.sessionId) continue;
      const s = getSession(evt.sessionId);
      if (!s) continue;
      s.couponClaimed = true;
      s.couponCode = evt.couponCode;
      s.couponChannel = evt.channel;
      s.couponDestination = evt.destination;
      s.couponClaimedAt = evt.createdAt.toISOString();
      s.country = evt.country || s.country;
    }

    // Merge checkout drafts
    for (const d of drafts) {
      const s = getSession(d.sessionId);
      if (!s) continue;
      s.hasCheckoutDraft = true;
      s.checkoutStatus = d.status;
      s.checkoutFullName = d.fullName;
      s.checkoutPhone = d.phone;
      s.checkoutEmail = d.email;
      s.checkoutGrandTotal = d.grandTotal ? parseFloat(d.grandTotal) : null;
      s.checkoutCartItems = Array.isArray(d.cartSnapshot) ? d.cartSnapshot.length : 0;
      s.checkoutLeadStatus = d.leadStatus;
      s.lastEditedField = d.lastEditedField;
      s.acquisitionSource = d.acquisitionSource || s.acquisitionSource;
      s.acquisitionCategory = d.acquisitionCategory || s.acquisitionCategory;
      s.utmSource = d.utmSource || s.utmSource;
      s.utmMedium = d.utmMedium || s.utmMedium;
      s.utmCampaign = d.utmCampaign || s.utmCampaign;
      s.country = d.country || s.country;
    }

    // Merge orders
    for (const o of allOrders) {
      const s = getSession(o.sessionId);
      if (!s) continue;
      s.hasOrder = true;
      s.orderNumber = o.orderNumber;
      s.orderStatus = o.status;
      s.orderGrandTotal = o.grandTotal ? parseFloat(o.grandTotal) : null;
      s.orderCreatedAt = o.createdAt.toISOString();
      s.acquisitionSource = o.acquisitionSource || s.acquisitionSource;
      s.acquisitionCategory = o.acquisitionCategory || s.acquisitionCategory;
      s.utmSource = o.utmSource || s.utmSource;
      s.utmMedium = o.utmMedium || s.utmMedium;
      s.utmCampaign = o.utmCampaign || s.utmCampaign;
    }

    // Merge session intelligence
    for (const intel of intelligence) {
      const s = getSession(intel.sessionId);
      if (!s) continue;
      s.intentScore = intel.intentScore;
      s.abandonmentRisk = intel.abandonmentRisk;
      s.predictedNextAction = intel.predictedNextAction;
      s.topAbandonmentCause = intel.topAbandonmentCause;
      s.totalInteractions = intel.totalInteractions;
      s.currentSection = intel.currentSection;
      s.lastActiveAt = intel.lastActiveAt?.toISOString() || s.lastActiveAt;
    }

    // Merge cart events (aggregated)
    for (const c of carts) {
      const s = getSession(c.sessionId);
      if (!s) continue;
      if (c.eventType === "cart_open") s.cartOpens++;
      if (c.eventType === "add_to_cart") s.addToCartCount++;
      if (c.eventType === "remove_from_cart") s.removeFromCartCount++;
      s.country = c.country || s.country;
    }

    // Merge consent/page view events
    for (const p of consents) {
      const s = getSession(p.sessionId);
      if (!s) continue;
      s.pagesVisited++;
      if (!s.firstSeenAt || p.createdAt.toISOString() < s.firstSeenAt) {
        s.firstSeenAt = p.createdAt.toISOString();
      }
    }

    const journeys = Array.from(sessionMap.values()).sort((a, b) => {
      // Sort by most recent activity
      const aTime = a.lastActiveAt || a.couponClaimedAt || a.firstSeenAt || "";
      const bTime = b.lastActiveAt || b.couponClaimedAt || b.firstSeenAt || "";
      return bTime.localeCompare(aTime);
    });

    // ── Return specific table or all ──────────────────────
    const tables: Record<string, unknown[]> = {
      customer_journeys: journeys,
      coupon_code_events: couponEvents.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      checkout_drafts: drafts.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), whatsappInitiatedAt: r.whatsappInitiatedAt?.toISOString() || null, lastContactedAt: r.lastContactedAt?.toISOString() || null, nextFollowUpAt: r.nextFollowUpAt?.toISOString() || null })),
      orders: allOrders.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString(), whatsappInitiatedAt: r.whatsappInitiatedAt.toISOString() })),
      cart_events: carts.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      consent_events: consents.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      behavioral_events: behaviors.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      session_intelligence: intelligence.map((r) => ({ ...r, lastActiveAt: r.lastActiveAt.toISOString(), createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
      section_attribution: sections.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() })),
      razorpay_webhook_events: razorpayEvents.map((r) => ({ ...r, eventCreatedAt: r.eventCreatedAt?.toISOString() || null, receivedAt: r.receivedAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
      email_events: emails.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
      products: allProducts.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
      reviews: allReviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    };

    // Single table download
    if (table !== "all" && tables[table]) {
      const data = tables[table] as Record<string, unknown>[];
      if (format === "csv") {
        const flatData = data.map((row) => flatten(row as Record<string, unknown>));
        const csv = toCsv(flatData);
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="hume_${table}_${days}d.csv"`,
          },
        });
      }
      return NextResponse.json({ table, days, rowCount: data.length, data });
    }

    // All tables download
    if (format === "csv") {
      // Return all tables as a JSON bundle with CSVs embedded
      const csvBundle: Record<string, string> = {};
      for (const [name, rows] of Object.entries(tables)) {
        const flatData = (rows as Record<string, unknown>[]).map((row) => flatten(row as Record<string, unknown>));
        csvBundle[name] = toCsv(flatData);
      }
      return NextResponse.json({
      exportedAt: new Date().toISOString(),
      days,
      tables: Object.keys(csvBundle),
        rowCounts: Object.fromEntries(
          Object.entries(tables).map(([k, v]) => [k, (v as unknown[]).length])
        ),
        csvData: csvBundle,
      });
    }

    // Full JSON export
    const rowCounts = Object.fromEntries(
      Object.entries(tables).map(([k, v]) => [k, (v as unknown[]).length])
    );

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      days,
      totalRows: Object.values(rowCounts).reduce((a, b) => a + b, 0),
      rowCounts,
      tables,
    });
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
