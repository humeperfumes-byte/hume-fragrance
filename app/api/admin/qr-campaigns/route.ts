import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCampaigns, flyerCampaignEvents } from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

async function ensureQRCampaignsTable() {
  try {
    await db.execute(sql`
      create table if not exists qr_campaigns (
        id varchar(255) primary key,
        name varchar(255) not null,
        city varchar(100) not null,
        target_page varchar(100) not null,
        target_url varchar(2048) not null,
        body_type varchar(50) default 'stars' not null,
        eye_style varchar(50) default 'rounded' not null,
        logo_type varchar(50) default 'hf-cursive' not null,
        qr_code_svg text,
        scan_count integer default 0 not null,
        last_scanned_at timestamp,
        created_at timestamp default now() not null
      );

      alter table qr_campaigns add column if not exists qr_code_svg text;

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
    console.error("Error ensuring qr_campaigns table:", err);
  }
}

export async function GET(req: Request) {
  try {
    await ensureQRCampaignsTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Single Campaign Drill-down View
    if (id) {
      const [campaign] = await db
        .select()
        .from(qrCampaigns)
        .where(eq(qrCampaigns.id, id))
        .limit(1);

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      // Fetch specific events linked strictly to this QR ID, or fallback to city & target page if qr_id is missing
      const events = await db
        .select()
        .from(flyerCampaignEvents)
        .where(
          sql`qr_id = ${id} or (qr_id is null and city = ${campaign.city} and target_page = ${campaign.targetPage})`
        )
        .orderBy(desc(flyerCampaignEvents.createdAt))
        .limit(100);

      // Compute exact campaign-specific funnel metrics
      const totalScans = events.filter((e) => e.eventType === "qr_scan").length;
      const couponCopies = events.filter((e) => e.eventType === "coupon_copy").length;
      const cartAdds = events.filter((e) => e.eventType === "add_to_cart").length;
      const checkouts = events.filter((e) => e.eventType === "checkout_start").length;
      const orderEvents = events.filter((e) => e.eventType === "order_complete");
      const totalOrders = orderEvents.length;
      const totalRevenue = orderEvents.reduce((sum, e) => sum + (parseFloat(e.revenue || "0") || 0), 0);
      const conversionRate = totalScans > 0 ? (totalOrders / totalScans) * 100 : 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const lastScanEvent = events.find((e) => e.eventType === "qr_scan");

      const enrichedCampaign = {
        ...campaign,
        scanCount: Math.max(campaign.scanCount || 0, totalScans),
        lastScannedAt: campaign.lastScannedAt || lastScanEvent?.createdAt || null,
        metrics: {
          totalScans,
          couponCopies,
          cartAdds,
          checkouts,
          totalOrders,
          totalRevenue,
          conversionRate: parseFloat(conversionRate.toFixed(1)),
          averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        },
        funnelStages: [
          { stage: "1. Flyer QR Scanned", count: totalScans, percentage: 100, color: "bg-blue-500" },
          { stage: "2. Coupon Code Copied", count: couponCopies, percentage: totalScans > 0 ? (couponCopies / totalScans) * 100 : 0, color: "bg-amber-500" },
          { stage: "3. Added to Cart", count: cartAdds, percentage: totalScans > 0 ? (cartAdds / totalScans) * 100 : 0, color: "bg-purple-500" },
          { stage: "4. Checkout Initiated", count: checkouts, percentage: totalScans > 0 ? (checkouts / totalScans) * 100 : 0, color: "bg-indigo-500" },
          { stage: "5. Paid Order Completed", count: totalOrders, percentage: totalScans > 0 ? (totalOrders / totalScans) * 100 : 0, color: "bg-emerald-500" },
        ],
      };

      return NextResponse.json({ success: true, campaign: enrichedCampaign, events });
    }

    // List all campaigns enriched with distinct scan event counts
    const campaigns = await db
      .select()
      .from(qrCampaigns)
      .orderBy(desc(qrCampaigns.createdAt));

    // Fetch total scans grouped by qr_id or fallback to city & target_page if qr_id is null
    const scanEvents = await db
      .select()
      .from(flyerCampaignEvents)
      .where(eq(flyerCampaignEvents.eventType, "qr_scan"));

    const enrichedCampaigns = campaigns.map((c) => {
      const matchingScans = scanEvents.filter((e) => {
        if (e.qrId) {
          return e.qrId === c.id;
        }
        return e.city.toLowerCase() === c.city.toLowerCase() && e.targetPage === c.targetPage;
      });
      const totalScans = matchingScans.length;
      const lastScan = matchingScans.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        ...c,
        scanCount: Math.max(c.scanCount || 0, totalScans),
        lastScannedAt: c.lastScannedAt || lastScan?.createdAt || null,
      };
    });

    return NextResponse.json({ success: true, campaigns: enrichedCampaigns });
  } catch (error) {
    console.error("Error fetching QR campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch QR campaigns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureQRCampaignsTable();
    const body = await req.json();

    const city = String(body.city || "ahmedabad").trim().toLowerCase();
    const targetPage = String(body.targetPage || "perfumes").trim();
    const name = String(body.name || `${city.toUpperCase()} ${targetPage === "perfumes" ? "Catalog" : "Discovery Set"} Flyer`).trim();
    const bodyType = String(body.bodyType || "stars").trim();
    const eyeStyle = String(body.eyeStyle || "rounded").trim();
    const logoType = String(body.logoType || "hf-cursive").trim();
    const qrCodeSvg = body.qrCodeSvg ? String(body.qrCodeSvg).trim() : null;

    // Convert campaign name to a clean, human-readable batch slug
    const cleanSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Generate unique ID using clean slug + timestamp suffix to avoid primary key conflict
    const timestampSuffix = Date.now().toString(36).slice(-4);
    const campaignId = body.batchTag?.trim()
      ? `qr-${city}-${targetPage}-${body.batchTag.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
      : `qr-${cleanSlug || `${city}-${targetPage}`}-${timestampSuffix}`;

    const baseDomain = "https://www.humefragrance.com";
    const targetUrl = body.customUrl?.trim()
      ? `${body.customUrl.trim()}${body.customUrl.includes("?") ? "&" : "?"}qr_id=${campaignId}`
      : `${baseDomain}/flyers/${city}/${targetPage}?qr_id=${campaignId}`;

    // Execute SQL UPSERT to handle primary key conflicts smoothly
    await db.execute(sql`
      insert into qr_campaigns (id, name, city, target_page, target_url, body_type, eye_style, logo_type, qr_code_svg, scan_count, created_at)
      values (${campaignId}, ${name}, ${city}, ${targetPage}, ${targetUrl}, ${bodyType}, ${eyeStyle}, ${logoType}, ${qrCodeSvg}, 0, now())
      on conflict (id) do update set
        name = excluded.name,
        target_url = excluded.target_url,
        body_type = excluded.body_type,
        eye_style = excluded.eye_style,
        logo_type = excluded.logo_type,
        qr_code_svg = excluded.qr_code_svg;
    `);

    const newCampaign = {
      id: campaignId,
      name,
      city,
      targetPage,
      targetUrl,
      bodyType,
      eyeStyle,
      logoType,
      qrCodeSvg,
      scanCount: 0,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error("Error creating QR campaign:", error);
    return NextResponse.json({ error: String(error) || "Failed to create QR campaign" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureQRCampaignsTable();
    const body = await req.json();

    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();

    if (!id || !name) {
      return NextResponse.json({ error: "ID and Name are required for updating campaign" }, { status: 400 });
    }

    await db
      .update(qrCampaigns)
      .set({ name })
      .where(eq(qrCampaigns.id, id));

    return NextResponse.json({ success: true, id, name });
  } catch (error) {
    console.error("Error updating campaign name:", error);
    return NextResponse.json({ error: "Failed to update campaign name" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await ensureQRCampaignsTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";

    // Wipe all test campaigns & events if requested
    if (clearAll) {
      await db.execute(sql`truncate table qr_campaigns cascade;`);
      await db.execute(sql`truncate table flyer_campaign_events cascade;`);
      return NextResponse.json({ success: true, message: "Cleared all test campaigns and funnel scan events." });
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Fetch target campaign to get city & target_page for complete cleanup
    const [targetCampaign] = await db
      .select()
      .from(qrCampaigns)
      .where(eq(qrCampaigns.id, id))
      .limit(1);

    // Delete associated scan and funnel events from database
    if (targetCampaign) {
      await db.execute(sql`
        delete from flyer_campaign_events 
        where qr_id = ${id} 
           or (city = ${targetCampaign.city} and target_page = ${targetCampaign.targetPage})
           or session_id like ${`%${id}%`}
           or coupon_code like ${`%${id}%`};
      `);
    } else {
      await db.execute(sql`
        delete from flyer_campaign_events where qr_id = ${id};
      `);
    }

    // Delete the campaign record
    await db.delete(qrCampaigns).where(eq(qrCampaigns.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Error deleting QR campaign:", error);
    return NextResponse.json({ error: "Failed to delete QR campaign" }, { status: 500 });
  }
}
