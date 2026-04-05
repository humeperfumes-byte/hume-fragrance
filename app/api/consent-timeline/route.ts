import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { consentEvents } from "@/db/schema";
import { isServerConsentTrackingEnabled } from "@/lib/consent-config";

const timelineSchema = z.object({
  sessionId: z.string().min(4).max(255),
  path: z.string().max(2048),
  eventType: z.string().min(2).max(80),
  language: z.string().max(50).optional(),
  timezone: z.string().max(100).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  if (!isServerConsentTrackingEnabled) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const body = await request.json();
    const payload = timelineSchema.parse(body);

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const userAgent = request.headers.get("user-agent");

    await db.insert(consentEvents).values({
      id: crypto.randomUUID(),
      decision: "allow",
      sessionId: payload.sessionId,
      path: payload.path,
      referrer: request.headers.get("referer"),
      ipAddress,
      userAgent,
      language: payload.language ?? null,
      timezone: payload.timezone ?? null,
      platform: null,
      screenWidth: null,
      screenHeight: null,
      cookieEnabled: null,
      data: {
        eventType: payload.eventType,
        ...payload.payload,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Consent timeline capture error:", error);
    return NextResponse.json({ error: "Failed to capture timeline event" }, { status: 500 });
  }
}
