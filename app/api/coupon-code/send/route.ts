import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { couponCodeEvents } from "@/db/schema";
import { getCouponByCode } from "@/lib/db/coupons";
import {
  buildCouponEmailHtml,
  buildCouponEmailSubject,
  buildCouponEmailText,
} from "@/lib/email/coupon-template";
import { isHumeMailConfigured, sendHumeEmail } from "@/lib/email/hume-mail-service";
import { isAdminCapturedPath, isInternalAdminRequest } from "@/lib/admin-data-filters";

const EARLY_BIRD_COUPON_CODE = "HUME_EARLY_BIRD";

const payloadSchema = z.object({
  email: z.string().email().max(255),
  sessionId: z.string().max(255).optional(),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  source: z.string().max(120).optional(),
});

function getRequestMeta(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
  const userAgent = request.headers.get("user-agent");
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    null;

  return { ipAddress, userAgent, country };
}

async function getEarlyBirdCouponCode() {
  const configuredCode =
    process.env.EARLY_BIRD_COUPON_CODE?.trim().toUpperCase() || EARLY_BIRD_COUPON_CODE;
  const coupon = await getCouponByCode(configuredCode);
  return coupon?.code?.toUpperCase() || configuredCode;
}

async function captureCouponEvent(
  event: {
    sessionId?: string;
    channel: "email" | "whatsapp";
    eventType: "requested" | "sent";
    couponCode?: string;
    destination?: string;
    path?: string;
    referrer?: string;
    payload?: Record<string, unknown>;
  },
  request: NextRequest,
) {
  const meta = getRequestMeta(request);
  await db.insert(couponCodeEvents).values({
    id: crypto.randomUUID(),
    sessionId: event.sessionId ?? null,
    channel: event.channel,
    eventType: event.eventType,
    couponCode: event.couponCode?.trim().toUpperCase() || null,
    destination: event.destination?.trim() || null,
    path: event.path ?? null,
    referrer: event.referrer ?? null,
    country: meta.country,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
    payload: event.payload ?? {},
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = payloadSchema.parse(body);

    if (isAdminCapturedPath(data.path)) {
      return NextResponse.json({ ok: true, skipped: "admin_page" });
    }

    if (isInternalAdminRequest(request) && data.source === "admin") {
      return NextResponse.json({ ok: true, skipped: "admin_traffic" });
    }

    const couponCode = await getEarlyBirdCouponCode();

    await captureCouponEvent(
      {
        sessionId: data.sessionId,
        channel: "email",
        eventType: "requested",
        couponCode,
        destination: data.email,
        path: data.path,
        referrer: data.referrer,
        payload: { source: data.source ?? "early_bird_popup" },
      },
      request,
    );

    let emailSent = false;

    if (isHumeMailConfigured()) {
      const emailResult = await sendHumeEmail({
        to: data.email,
        subject: buildCouponEmailSubject(couponCode),
        text: buildCouponEmailText(couponCode),
        html: buildCouponEmailHtml(couponCode, data.email),
        messageType: "coupon_code",
        relatedType: "coupon",
        relatedId: couponCode,
        payload: {
          source: data.source ?? "early_bird_popup",
          sessionId: data.sessionId ?? null,
        },
      });
      emailSent = emailResult.sent;
    }

    if (emailSent) {
      await captureCouponEvent(
        {
          sessionId: data.sessionId,
          channel: "email",
          eventType: "sent",
          couponCode,
          destination: data.email,
          path: data.path,
          referrer: data.referrer,
          payload: { source: data.source ?? "early_bird_popup", provider: "resend" },
        },
        request,
      );
    }

    const whatsappText = `Hi HUME, please share my starting code. I registered with ${data.email}. Suggested code: ${couponCode}`;
    const whatsappLink = `https://wa.me/919559024822?text=${encodeURIComponent(whatsappText)}`;

    return NextResponse.json({
      ok: true,
      couponCode,
      emailSent,
      whatsappLink,
      providerConfigured: isHumeMailConfigured(),
    });
  } catch (error) {
    console.error("coupon-code send error:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to send coupon right now." },
      { status: 500 },
    );
  }
}
