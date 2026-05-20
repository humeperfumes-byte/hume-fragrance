import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { consentEvents } from "@/db/schema";
import { z } from "zod";
import { isServerConsentTrackingEnabled } from "@/lib/consent-config";
import { isAdminCapturedPath } from "@/lib/admin-data-filters";

const payloadSchema = z.object({
  decision: z.enum(["allow", "deny"]),
  sessionId: z.string().min(4).max(255),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  language: z.string().max(50).optional(),
  timezone: z.string().max(100).optional(),
  platform: z.string().max(100).optional(),
  screenWidth: z.number().int().optional(),
  screenHeight: z.number().int().optional(),
  cookieEnabled: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  if (!isServerConsentTrackingEnabled) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const body = await request.json();
    const payload = payloadSchema.parse(body);

    if (isAdminCapturedPath(payload.path)) {
      return NextResponse.json({ ok: true, skipped: "admin_page" });
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const userAgent = request.headers.get("user-agent");

    await db.insert(consentEvents).values({
      id: crypto.randomUUID(),
      decision: payload.decision,
      sessionId: payload.sessionId,
      path: payload.path ?? null,
      referrer: payload.referrer ?? null,
      ipAddress,
      userAgent,
      language: payload.language ?? null,
      timezone: payload.timezone ?? null,
      platform: payload.platform ?? null,
      screenWidth: payload.screenWidth ?? null,
      screenHeight: payload.screenHeight ?? null,
      cookieEnabled: payload.cookieEnabled ?? null,
      data: payload.data ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Consent capture error:", error);
    return NextResponse.json({ error: "Failed to capture consent event" }, { status: 500 });
  }
}
