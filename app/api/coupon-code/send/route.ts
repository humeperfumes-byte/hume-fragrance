import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminCapturedPath, isInternalAdminRequest } from "@/lib/admin-data-filters";
import { sendAdminEarlyBirdAlert } from "@/lib/notifications/admin-early-bird-alert";

const EARLY_BIRD_COUPON_CODE = "HUME_EARLY_BIRD";
const RECENT_ALERT_WINDOW_MS = 15 * 60 * 1000;
const recentAlerts = new Map<string, number>();

const payloadSchema = z.object({
  phone: z.string().trim().min(10).max(20),
  sessionId: z.string().max(255).optional(),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  source: z.string().max(120).optional(),
});

function normalizeIndianWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return /^91[6-9]\d{9}$/.test(normalized) ? normalized : null;
}

export async function POST(request: NextRequest) {
  try {
    const data = payloadSchema.parse(await request.json());

    if (isAdminCapturedPath(data.path)) {
      return NextResponse.json({ ok: true, skipped: "admin_page" });
    }
    if (isInternalAdminRequest(request) && data.source === "admin") {
      return NextResponse.json({ ok: true, skipped: "admin_traffic" });
    }

    const phone = normalizeIndianWhatsAppNumber(data.phone);
    if (!phone) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid Indian WhatsApp number." },
        { status: 400 },
      );
    }

    const couponCode = process.env.EARLY_BIRD_COUPON_CODE?.trim().toUpperCase() || EARLY_BIRD_COUPON_CODE;
    const dedupeKey = `${couponCode}:${phone}`;
    const lastAlertAt = recentAlerts.get(dedupeKey) ?? 0;
    if (Date.now() - lastAlertAt < RECENT_ALERT_WINDOW_MS) {
      return NextResponse.json({ ok: true, deduped: true });
    }

    const notificationSent = await sendAdminEarlyBirdAlert({
      phone,
      couponCode,
      path: data.path,
    });

    if (!notificationSent) {
      return NextResponse.json(
        { ok: false, message: "We could not register this request. Please try again." },
        { status: 503 },
      );
    }

    recentAlerts.set(dedupeKey, Date.now());
    return NextResponse.json({ ok: true, notificationSent: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, message: "Enter a valid WhatsApp number." },
        { status: 400 },
      );
    }
    console.error("Early Bird request error:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to register your request right now." },
      { status: 500 },
    );
  }
}
