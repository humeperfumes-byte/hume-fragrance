import { NextRequest, NextResponse } from "next/server";
import { desc, gte } from "drizzle-orm";
import { db } from "@/db";
import { cartEvents, checkoutDrafts, consentEvents } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

type TimelineRow = {
  sessionId: string;
  path: string | null;
  createdAt: Date;
  data: Record<string, unknown>;
};

type CartRow = {
  sessionId: string;
  eventType: string;
  productId: string | null;
  productName: string | null;
  createdAt: Date;
};

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(24 * 90, Math.max(1, Number(searchParams.get("hours") || "720")));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [timelineRows, cartRows, draftRows] = await Promise.all([
      db
        .select({
          sessionId: consentEvents.sessionId,
          path: consentEvents.path,
          createdAt: consentEvents.createdAt,
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
          createdAt: cartEvents.createdAt,
        })
        .from(cartEvents)
        .where(gte(cartEvents.createdAt, since))
        .orderBy(desc(cartEvents.createdAt))
        .limit(10000) as Promise<CartRow[]>,
      db
        .select({
          id: checkoutDrafts.id,
          status: checkoutDrafts.status,
          grandTotal: checkoutDrafts.grandTotal,
          updatedAt: checkoutDrafts.updatedAt,
          whatsappInitiatedAt: checkoutDrafts.whatsappInitiatedAt,
        })
        .from(checkoutDrafts)
        .where(gte(checkoutDrafts.updatedAt, since))
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(5000),
    ]);

    const pageViews = timelineRows.filter((row) => row.data?.eventType === "page_view");
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

    const productClickRows = timelineRows.filter((row) => row.data?.eventType === "product_click");
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
    cartRows
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
      cartRows.filter((row) => row.eventType === "cart_open").map((row) => row.sessionId),
    );

    const totalCartOpens = cartRows.filter((row) => row.eventType === "cart_open").length;
    const totalAddToCart = cartRows.filter((row) => row.eventType === "add_to_cart").length;
    const totalQuantityUpdates = cartRows.filter(
      (row) => row.eventType === "update_cart_quantity",
    ).length;
    const totalRemoveFromCart = cartRows.filter(
      (row) => row.eventType === "remove_from_cart",
    ).length;

    const activeDrafts = draftRows.filter((row) => row.status !== "started");
    const whatsappInitiatedDrafts = draftRows.filter(
      (row) => row.status === "whatsapp_initiated" || row.whatsappInitiatedAt,
    );
    const draftValue = activeDrafts.reduce(
      (sum, row) => sum + Number.parseFloat(String(row.grandTotal ?? "0") || "0"),
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

    return NextResponse.json({
      ok: true,
      windowHours: hours,
      overview: {
        uniqueViewers: uniqueViewerSessions.size,
        uniqueCartVisitors: uniqueCartOpenSessions.size,
        totalPageViews: pageViews.length,
        totalCartOpens,
        totalAddToCart,
        totalQuantityUpdates,
        totalRemoveFromCart,
        activeDrafts: activeDrafts.length,
        whatsappInitiatedDrafts: whatsappInitiatedDrafts.length,
        abandonedDraftValue: draftValue,
      },
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
