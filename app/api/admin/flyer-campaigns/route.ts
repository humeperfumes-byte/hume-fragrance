import { NextResponse } from "next/server";
import { db } from "@/db";
import { flyerCampaignEvents } from "@/db/schema";
import { sql, desc } from "drizzle-orm";

async function ensureFlyerEventsTable() {
  try {
    await db.execute(sql`
      create table if not exists flyer_campaign_events (
        id varchar(255) primary key,
        qr_id varchar(255),
        city varchar(100) not null,
        target_page varchar(100) not null,
        event_type varchar(50) not null,
        coupon_code varchar(50),
        session_id varchar(255),
        order_id varchar(255),
        revenue numeric(10, 2),
        created_at timestamp default now() not null
      );

      alter table flyer_campaign_events add column if not exists qr_id varchar(255);
    `);
  } catch (err) {
    console.error("Error ensuring flyer_campaign_events table:", err);
  }
}

export async function GET(req: Request) {
  try {
    await ensureFlyerEventsTable();
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

    // 5-Stage Visual Funnel Calculations
    const funnelStages = [
      {
        stage: "1. Flyer QR Scanned",
        count: totalScans,
        percentage: 100,
        color: "bg-blue-500",
      },
      {
        stage: "2. Coupon Code Copied",
        count: couponCopies,
        percentage: totalScans > 0 ? (couponCopies / totalScans) * 100 : 0,
        color: "bg-amber-500",
      },
      {
        stage: "3. Added to Cart",
        count: cartAdds,
        percentage: totalScans > 0 ? (cartAdds / totalScans) * 100 : 0,
        color: "bg-purple-500",
      },
      {
        stage: "4. Checkout Initiated",
        count: checkouts,
        percentage: totalScans > 0 ? (checkouts / totalScans) * 100 : 0,
        color: "bg-indigo-500",
      },
      {
        stage: "5. Paid Order Completed",
        count: totalOrders,
        percentage: totalScans > 0 ? (totalOrders / totalScans) * 100 : 0,
        color: "bg-emerald-500",
      },
    ];

    // City Comparison Rankings
    const citiesList = ["ahmedabad", "mumbai", "delhi", "bengaluru", "surat", "vadodara", "jaipur"];
    const cityBreakdown = citiesList.map((city) => {
      const cityEvents = events.filter((e) => e.city.toLowerCase() === city);
      const cScans = cityEvents.filter((e) => e.eventType === "qr_scan").length;
      const cCopies = cityEvents.filter((e) => e.eventType === "coupon_copy").length;
      const cCartAdds = cityEvents.filter((e) => e.eventType === "add_to_cart").length;
      const cCheckouts = cityEvents.filter((e) => e.eventType === "checkout_start").length;
      const cOrdersList = cityEvents.filter((e) => e.eventType === "order_complete");
      const cOrders = cOrdersList.length;
      const cRevenue = cOrdersList.reduce((sum, e) => sum + (parseFloat(e.revenue || "0") || 0), 0);
      const cConv = cScans > 0 ? (cOrders / cScans) * 100 : 0;

      return {
        city,
        scans: cScans,
        copies: cCopies,
        cartAdds: cCartAdds,
        checkouts: cCheckouts,
        orders: cOrders,
        conversionRate: parseFloat(cConv.toFixed(1)),
        revenue: cRevenue,
      };
    }).sort((a, b) => b.revenue - a.revenue || b.scans - a.scans);

    return NextResponse.json({
      success: true,
      totals: {
        totalScans,
        couponCopies,
        cartAdds,
        checkouts,
        totalOrders,
        totalRevenue,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      },
      funnelStages,
      cityBreakdown,
    });
  } catch (error) {
    console.error("Error fetching flyer campaign analytics:", error);
    return NextResponse.json({ error: "Failed to fetch flyer analytics" }, { status: 500 });
  }
}
