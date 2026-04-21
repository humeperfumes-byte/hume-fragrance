import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { couponCodeEvents } from "@/db/schema";

const payloadSchema = z.object({
  sessionId: z.string().max(255).optional(),
  channel: z.enum(["email", "whatsapp"]),
  eventType: z.enum(["requested", "sent"]).default("sent"),
  couponCode: z.string().max(100).optional(),
  destination: z.string().max(255).optional(),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = payloadSchema.parse(body);

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const userAgent = request.headers.get("user-agent");
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    await db.insert(couponCodeEvents).values({
      id: crypto.randomUUID(),
      sessionId: data.sessionId ?? null,
      channel: data.channel,
      eventType: data.eventType,
      couponCode: data.couponCode?.trim().toUpperCase() || null,
      destination: data.destination?.trim() || null,
      path: data.path ?? null,
      referrer: data.referrer ?? null,
      country,
      ipAddress,
      userAgent,
      payload: data.payload ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("coupon-code-events capture error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

