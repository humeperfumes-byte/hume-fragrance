import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { createHash } from "node:crypto";
export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== req.nextUrl.origin)
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    const body = await req.json();
    const qrId = typeof body.qrId === "string" ? body.qrId.trim() : "";
    const session =
      typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    const eventType = body.eventType;
    // Revenue and orders must never be accepted from public analytics requests.
    if (
      !["qr_scan", "coupon_copy", "add_to_cart", "checkout_start"].includes(
        eventType,
      )
    )
      return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
    if (!qrId || qrId.length > 255 || !session || session.length > 255)
      return NextResponse.json(
        { error: "Known QR ID and session required" },
        { status: 400 },
      );
    const campaigns = await db.execute(
      sql`select id,city,target_page,archived_at from qr_campaigns where id=${qrId}`,
    );
    if (!campaigns.length || campaigns[0].archived_at)
      return NextResponse.json(
        { error: "QR code unavailable" },
        { status: 404 },
      );
    const c = campaigns[0];
    const eventId =
      "flyer-" +
      createHash("sha256")
        .update(
          `${qrId}:${session}:${eventType}:${Math.floor(Date.now() / 10000)}`,
        )
        .digest("hex");
    await db.execute(sql`with inserted as (
   insert into flyer_campaign_events(id,qr_id,city,target_page,event_type,session_id)
   values (${eventId},${qrId},${c.city},${c.target_page},${eventType},${session}) on conflict(id) do nothing returning id
  ) update qr_campaigns set scan_count=scan_count+1,last_scanned_at=now() where id=${qrId} and ${eventType}='qr_scan' and exists(select 1 from inserted)`);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not record event" },
      { status: 500 },
    );
  }
}
