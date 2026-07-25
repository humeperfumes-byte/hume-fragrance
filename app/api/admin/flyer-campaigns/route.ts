import { NextResponse } from "next/server";
import { db } from "@/db";
import { flyerCampaignEvents } from "@/db/schema";
import { sql, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const selectedCity = searchParams.get("city") || "all";

    // Query all flyer events from database
    const events = await db
      .select()
      .from(flyerCampaignEvents)
      .orderBy(desc(flyerCampaignEvents.createdAt));

    // Filter by city if selected
    const filteredEvents = selectedCity === "all"
      ? events
      : events.filter((e) => e.city.toLowerCase() === selectedCity.toLowerCase());

    const totalScans = filteredEvents.filter((e) => e.eventType === "qr_scan").length;
    const couponCopies = filteredEvents.filter((e) => e.eventType === "coupon_copy").length;
    const cartAdds = filteredEvents.filter((e) => e.eventType === "add_to_cart").length;
    const checkouts = filteredEvents.filter((e) => e.eventType === "checkout_start").length;
    const orderEvents = filteredEvents.filter((e) => e.eventType === "order_complete");
    const totalOrders = orderEvents.length;

    const totalRevenue = orderEvents.reduce((sum, e) => {
      const val = parseFloat(e.revenue || "0");
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const conversionRate = totalScans > 0 ? (totalOrders / totalScans) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Full Funnel Ratio Stages
    const funnelStages = [
      {
        stage: "QR Scans / Visits",
        count: totalScans,
        percentage: 100,
        color: "bg-blue-500",
      },
      {
        stage: "Coupon Copies",
        count: couponCopies,
        percentage: totalScans > 0 ? Math.min(100, (couponCopies / totalScans) * 100) : 0,
        color: "bg-amber-500",
      },
      {
        stage: "Cart Additions",
        count: cartAdds,
        percentage: totalScans > 0 ? Math.min(100, (cartAdds / totalScans) * 100) : 0,
        color: "bg-purple-500",
      },
      {
        stage: "Checkout Initiated",
        count: checkouts,
        percentage: totalScans > 0 ? Math.min(100, (checkouts / totalScans) * 100) : 0,
        color: "bg-indigo-500",
      },
      {
        stage: "Paid Orders",
        count: totalOrders,
        percentage: totalScans > 0 ? Math.min(100, (totalOrders / totalScans) * 100) : 0,
        color: "bg-emerald-500",
      },
    ];

    // City Breakdown Metrics
    const citiesMap = new Map<string, {
      city: string;
      scans: number;
      copies: number;
      cartAdds: number;
      checkouts: number;
      orders: number;
      revenue: number;
    }>();

    events.forEach((e) => {
      const cityName = e.city.toLowerCase();
      const existing = citiesMap.get(cityName) || {
        city: cityName,
        scans: 0,
        copies: 0,
        cartAdds: 0,
        checkouts: 0,
        orders: 0,
        revenue: 0,
      };

      if (e.eventType === "qr_scan") existing.scans += 1;
      if (e.eventType === "coupon_copy") existing.copies += 1;
      if (e.eventType === "add_to_cart") existing.cartAdds += 1;
      if (e.eventType === "checkout_start") existing.checkouts += 1;
      if (e.eventType === "order_complete") {
        existing.orders += 1;
        const val = parseFloat(e.revenue || "0");
        existing.revenue += isNaN(val) ? 0 : val;
      }

      citiesMap.set(cityName, existing);
    });

    const cityBreakdown = Array.from(citiesMap.values()).map((item) => {
      const conv = item.scans > 0 ? (item.orders / item.scans) * 100 : 0;
      return {
        ...item,
        conversionRate: parseFloat(conv.toFixed(2)),
      };
    });

    return NextResponse.json({
      success: true,
      selectedCity,
      totals: {
        totalScans,
        couponCopies,
        cartAdds,
        checkouts,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      },
      funnelStages,
      cityBreakdown,
      recentEvents: filteredEvents.slice(0, 15),
    });
  } catch (error) {
    console.error("Error fetching flyer campaign analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
