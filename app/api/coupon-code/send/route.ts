import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { db } from "@/db";
import { couponCodeEvents } from "@/db/schema";
import { getActiveCoupons } from "@/lib/db/coupons";
import { SITE_URL } from "@/lib/site";

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

function buildCouponEmailText(couponCode: string) {
  return [
    "HUME FRAGRANCE",
    "",
    "Your starting code is ready.",
    "",
    `Coupon Code: ${couponCode}`,
    "",
    "Use this code at checkout on humefragrance.com.",
    "",
    "Need help choosing a scent?",
    "WhatsApp: +91 95590 24822",
  ].join("\n");
}

function buildCouponEmailHtml(couponCode: string, recipientEmail: string) {
  const guessedName = recipientEmail.split("@")[0]?.replace(/[._-]+/g, " ");
  const greetingName =
    guessedName && guessedName.length > 1
      ? guessedName
          .split(" ")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "there";
  const heroImageUrl = `${SITE_URL}/images/email/b3g1_image.png`;
  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your HUME Starting Code</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4f6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:720px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:0;background:#0f172a;color:#ffffff;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:16px 20px 0;">
                      <img src="https://www.humefragrance.com/images/logo.png?v=3" alt="HUME Fragrance" width="44" height="44" style="display:block;border:0;outline:none;text-decoration:none;border-radius:10px;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 20px 22px;background:linear-gradient(135deg,#0b1326 0%,#152449 45%,#1f4d87 100%);">
                      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">Hume Fragrance</p>
                      <img src="${heroImageUrl}" alt="HUME B3G1 Offer" width="680" style="display:block;width:100%;max-width:680px;height:auto;border:0;outline:none;text-decoration:none;border-radius:12px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 26px;">
                <p style="margin:0 0 14px;font-size:32px;line-height:1.2;font-weight:300;color:#111827;">Hi ${greetingName},</p>
                <p style="margin:0 0 16px;font-size:19px;line-height:1.65;color:#374151;">Use this code during checkout to activate your first-order offer.</p>
                <div style="margin:0 0 18px;padding:20px;border:1px dashed #0f172a;border-radius:14px;background:#f9fafb;text-align:center;">
                  <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#6b7280;">Coupon Code</p>
                  <p style="margin:0;font-size:34px;letter-spacing:0.2em;font-weight:700;color:#111827;">${couponCode}</p>
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 14px;">
                  <tr>
                    <td>
                      <a href="https://www.humefragrance.com/checkout" style="display:inline-block;padding:13px 24px;border-radius:12px;background:#1f4d87;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Use At Checkout</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b7280;">Need help selecting your fragrance?</p>
                <p style="margin:0;font-size:14px;">
                  <a href="https://wa.me/919559024822" style="color:#0f766e;text-decoration:none;font-weight:600;">WhatsApp us: +91 95590 24822</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 24px;border-top:1px solid #e5e7eb;background:#fafafa;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated coupon email from HUME Fragrance.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
