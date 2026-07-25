import { NextResponse } from "next/server";
import { db } from "@/db";
import { flyerCampaignEvents } from "@/db/schema";
import { sql } from "drizzle-orm";

async function ensureFlyerEventsTable() {
  try {
    await db.execute(sql`
      create table if not exists flyer_campaign_events (
        id varchar(255) primary key,
        city varchar(100) not null,
        target_page varchar(100) not null,
        event_type varchar(50) not null,
        coupon_code varchar(50),
        session_id varchar(255),
        order_id varchar(255),
        revenue numeric(10, 2),
        created_at timestamp default now() not null
      );
    `);
  } catch (err) {
    console.error("Error ensuring flyer_campaign_events table:", err);
  }
}

export async function POST(req: Request) {
  try {
    await ensureFlyerEventsTable();
    const body = await req.json();

    const city = String(body.city || "").trim().toLowerCase();
    const targetPage = String(body.targetPage || "perfumes").trim();
    const eventType = String(body.eventType || "qr_scan").trim();
    const couponCode = body.couponCode ? String(body.couponCode).trim() : null;
    const sessionId = body.sessionId ? String(body.sessionId).trim() : null;
    const orderId = body.orderId ? String(body.orderId).trim() : null;
    const revenue = typeof body.revenue === "number" ? body.revenue.toFixed(2) : null;

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const eventId = `flyer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    await db.insert(flyerCampaignEvents).values({
      id: eventId,
      city,
      targetPage,
      eventType,
      couponCode,
      sessionId,
      orderId,
      revenue,
    });

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error("Error logging flyer campaign event:", error);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
