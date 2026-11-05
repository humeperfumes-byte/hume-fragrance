import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { requireAdminToken } from "@/lib/admin-auth";
import { normalizeQrDestination, QR_ORIGIN, qrScanCsv } from "@/lib/qr-system";
export const dynamic = "force-dynamic";
const response = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
export async function GET(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  try {
    const id = req.nextUrl.searchParams.get("id");
    const days = Math.trunc(
      Math.min(
        365,
        Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30),
      ),
    );
    const page = Math.trunc(
      Math.max(
        1,
        Math.min(100000, Number(req.nextUrl.searchParams.get("page")) || 1),
      ),
    );
    const campaigns = await db.execute(sql`
   select c.id, c.name, c.target_url, c.target_page, c.archived_at, c.created_at, c.scan_count,
   (select count(*)::int from qr_scan_events e where e.campaign_id=c.id) as tracked_scans,
   (select count(distinct visitor_id)::int from qr_scan_events e where e.campaign_id=c.id) as unique_visitors,
   (select max(scanned_at) from qr_scan_events e where e.campaign_id=c.id) as tracked_last_scan
   from qr_campaigns c order by c.created_at desc`);
    if (!id) return response({ success: true, campaigns });
    if (!campaigns.some((c) => c.id === id))
      return response({ error: "QR code not found" }, 404);
    if (req.nextUrl.searchParams.get("format") === "csv") {
      const rows = await db.execute(
        sql`select scanned_at, device, browser, referrer_host from qr_scan_events where campaign_id=${id} and scanned_at >= now() - ${days} * interval '1 day' order by scanned_at desc, id desc`,
      );
      return new NextResponse(
        qrScanCsv(
          rows.map((row) => ({
            scanned_at: String(row.scanned_at),
            device: String(row.device),
            browser: String(row.browser),
            referrer_host: row.referrer_host ? String(row.referrer_host) : null,
          })),
        ),
        {
          headers: {
            "Cache-Control": "private, no-store",
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${id.replace(/[^a-zA-Z0-9-]/g, "")}-${days}days.csv"`,
          },
        },
      );
    }
    const stats = await db.execute(
      sql`select count(*)::int as scans, count(distinct visitor_id)::int as visitors, max(scanned_at) as last_scan from qr_scan_events where campaign_id=${id} and scanned_at >= now() - ${days} * interval '1 day'`,
    );
    const daily = await db.execute(
      sql`select to_char(scanned_at at time zone 'Asia/Kolkata', 'YYYY-MM-DD') as day, count(*)::int as scans from qr_scan_events where campaign_id=${id} and scanned_at >= now() - ${days} * interval '1 day' group by 1 order by 1`,
    );
    const devices = await db.execute(
      sql`select device, count(*)::int as scans from qr_scan_events where campaign_id=${id} and scanned_at >= now() - ${days} * interval '1 day' group by device order by scans desc`,
    );
    const events = await db.execute(
      sql`select id, scanned_at, device, browser, referrer_host from qr_scan_events where campaign_id=${id} and scanned_at >= now() - ${days} * interval '1 day' order by scanned_at desc, id desc limit 50 offset ${(page - 1) * 50}`,
    );
    return response({
      success: true,
      campaigns,
      stats: stats[0],
      daily,
      devices,
      events,
      page,
    });
  } catch (error) {
    console.error("QR read failed", error);
    return response(
      {
        error:
          "Could not load QR data. Ensure the QR database migration has been applied.",
      },
      500,
    );
  }
}
export async function POST(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 255)
      return response({ error: "Enter a name up to 255 characters." }, 400);
    let destination: string;
    try {
      destination = normalizeQrDestination(String(body.destination || ""));
    } catch (e) {
      return response({ error: (e as Error).message }, 400);
    }
    const id = `qr-${crypto.randomUUID()}`;
    await db.execute(
      sql`insert into qr_campaigns(id,name,city,target_page,target_url,body_type,eye_style,logo_type) values (${id},${name},'general','custom',${destination},'squares','square','none')`,
    );
    return response(
      { success: true, id, trackingUrl: `${QR_ORIGIN}/q/${id}` },
      201,
    );
  } catch {
    return response({ error: "Could not create QR code." }, 500);
  }
}
export async function PATCH(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    if (typeof body.id !== "string")
      return response({ error: "QR ID required." }, 400);
    const rows = await db.execute(
      sql`select * from qr_campaigns where id=${body.id}`,
    );
    if (!rows.length) return response({ error: "QR code not found." }, 404);
    const name =
      typeof body.name === "string" ? body.name.trim() : String(rows[0].name);
    if (!name || name.length > 255)
      return response({ error: "Enter a name up to 255 characters." }, 400);
    let destination = String(rows[0].target_url);
    if (body.destination !== undefined) {
      try {
        destination = normalizeQrDestination(String(body.destination));
      } catch (e) {
        return response({ error: (e as Error).message }, 400);
      }
    }
    const archivedAt =
      typeof body.archived === "boolean"
        ? body.archived
          ? new Date().toISOString()
          : null
        : rows[0].archived_at
          ? new Date(String(rows[0].archived_at)).toISOString()
          : null;
    await db.execute(
      sql`update qr_campaigns set name=${name}, target_url=${destination}, archived_at=${archivedAt} where id=${body.id}`,
    );
    return response({ success: true });
  } catch {
    return response({ error: "Could not update QR code." }, 500);
  }
}
export async function DELETE(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  return response(
    { error: "Archive QR codes instead. Historical data is preserved." },
    405,
  );
}
