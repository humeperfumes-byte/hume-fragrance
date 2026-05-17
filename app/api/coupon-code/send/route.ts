import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { db } from "@/db";
import { couponCodeEvents } from "@/db/schema";
import { getActiveCoupons } from "@/lib/db/coupons";
import { buildCouponEmailHtml, buildCouponEmailText } from "@/lib/email/coupon-template";
import { isInternalAdminRequest } from "@/lib/admin-data-filters";

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

function getCouponCode(codeList: Array<{ code: string; minSubtotal: number }>) {
  return (
    codeList
      .sort((a, b) => Number(a.minSubtotal ?? 0) - Number(b.minSubtotal ?? 0))[0]
      ?.code?.toUpperCase() ?? "CASH5"
  );
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
  if (isInternalAdminRequest(request)) {
    return NextResponse.json({ ok: true, skipped: "admin_traffic" });
  }

  try {
    const body = await request.json();
    const data = payloadSchema.parse(body);
    const activeCoupons = await getActiveCoupons({ cartOnly: true });
    const couponCode = getCouponCode(
      activeCoupons
        .filter((coupon) => Boolean(coupon.code))
        .map((coupon) => ({
          code: coupon.code,
          minSubtotal: Number(coupon.minSubtotal ?? 0),
        })),
    );

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

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.COUPON_EMAIL_FROM;
    let emailSent = false;

    if (resendApiKey && fromEmail) {
      const resend = new Resend(resendApiKey);
      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: [data.email],
        subject: `Your HUME starting code: ${couponCode}`,
        text: buildCouponEmailText(couponCode),
        html: buildCouponEmailHtml(couponCode, data.email),
      });
      emailSent = Boolean(sendResult?.data?.id);
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
      providerConfigured: Boolean(resendApiKey && fromEmail),
    });
  } catch (error) {
    console.error("coupon-code send error:", error);
    return NextResponse.json(
      { ok: false, message: "Unable to send coupon right now." },
      { status: 500 },
    );
  }
}
