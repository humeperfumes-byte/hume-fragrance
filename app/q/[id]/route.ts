import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { normalizeQrDestination, qrDevice, qrBrowser } from "@/lib/qr-system";
export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const headers = {
    "Cache-Control": "no-store, private",
    "X-Robots-Tag": "noindex, nofollow",
    "Referrer-Policy": "no-referrer",
  };
  try {
    const rows = await db.execute(
      sql`select target_url, archived_at from qr_campaigns where id=${id}`,
    );
    if (!rows.length || rows[0].archived_at)
      return new NextResponse(
        "This QR code is unavailable. Please visit humefragrance.com.",
        { status: 410, headers },
      );
    const destination = normalizeQrDestination(String(rows[0].target_url));
    const agent = req.headers.get("user-agent") || "";
    const device = qrDevice(agent);
    const previous = req.cookies.get("hume_qr_visitor")?.value || "";
    const visitor =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        previous,
      )
        ? previous
        : crypto.randomUUID();
    if (
      device !== "bot" &&
      !req.headers.get("purpose")?.includes("prefetch") &&
      !req.headers.get("sec-purpose")?.includes("prefetch")
    ) {
      let referrer: string | null = null;
      try {
        referrer = new URL(req.headers.get("referer") || "").hostname.slice(
          0,
          255,
        );
      } catch {}
      try {
        await db.execute(
          sql`insert into qr_scan_events(id,campaign_id,visitor_id,device,browser,referrer_host,bucket) values (${crypto.randomUUID()},${id},${visitor},${device},${qrBrowser(agent)},${referrer},${Math.floor(Date.now() / 10000)}) on conflict(campaign_id,visitor_id,bucket) do nothing`,
        );
      } catch (error) {
        console.error("QR scan recording failed", error);
      }
    }
    const res = NextResponse.redirect(destination, { status: 302, headers });
    res.cookies.set("hume_qr_visitor", visitor, {
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
      path: "/q",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch {
    return new NextResponse(
      "QR service temporarily unavailable. Please try again.",
      { status: 503, headers },
    );
  }
}
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const rows = await db.execute(
      sql`select target_url, archived_at from qr_campaigns where id=${id}`,
    );
    if (!rows.length || rows[0].archived_at)
      return new NextResponse(null, { status: 410 });
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: normalizeQrDestination(String(rows[0].target_url)),
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
