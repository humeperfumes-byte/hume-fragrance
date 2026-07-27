import { NextResponse } from "next/server";
import { db } from "@/db";
import { flyerCampaignEvents } from "@/db/schema";
import { sql } from "drizzle-orm";

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
    const qrId = body.qrId ? String(body.qrId).trim() : null;
    const revenue = typeof body.revenue === "number" ? body.revenue.toFixed(2) : null;

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 });
    }

    const eventId = `flyer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    await db.insert(flyerCampaignEvents).values({
      id: eventId,
      qrId,
      city,
      targetPage,
      eventType,
      couponCode,
      sessionId,
      orderId,
      revenue,
    });

    // If a specific registered QR ID was scanned, increment its scan count and last scanned date
    if (qrId && eventType === "qr_scan") {
      try {
        await db.execute(sql`
          update qr_campaigns 
          set scan_count = scan_count + 1, last_scanned_at = now()
          where id = ${qrId}
        `);

        // Safeguard: If campaign was accidentally deleted from DB, auto-resurrect it to prevent missing analytics
        const check = await db.execute(sql`select count(*) as cnt from qr_campaigns where id = ${qrId}`);
        const cnt = Number((check as any)?.[0]?.cnt || (check as any)?.rows?.[0]?.cnt || 0);
        if (cnt === 0) {
          const autoName = `${city.toUpperCase()} Printed Pamphlet (Auto-Recovered)`;
          const autoUrl = `https://www.humefragrance.com/flyers/${city}/${targetPage}?qr_id=${qrId}`;
          await db.execute(sql`
            insert into qr_campaigns (id, name, city, target_page, target_url, body_type, eye_style, logo_type, scan_count, last_scanned_at, created_at)
            values (${qrId}, ${autoName}, ${city}, ${targetPage}, ${autoUrl}, 'stars', 'rounded', 'hf-cursive', 1, now(), now())
            on conflict (id) do update set scan_count = qr_campaigns.scan_count + 1, last_scanned_at = now();
          `);
        }
      } catch (err) {
        console.error("Error updating or auto-recovering qr_campaigns scan count:", err);
      }
    }

    return NextResponse.json({ success: true, eventId });
  } catch (error) {
    console.error("Error logging flyer campaign event:", error);
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
