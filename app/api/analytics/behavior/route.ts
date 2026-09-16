import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { behavioralEvents } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId || body.session_id;
    if (!sessionId) return new NextResponse(null, { status: 204 });

    const id = randomUUID();
    const eventType = String(body.eventType || body.event_type || "page_view").slice(0, 100);
    const path = String(body.path || req.headers.get("referer") || "").slice(0, 2048);
    const sectionName = body.sectionName ? String(body.sectionName).slice(0, 255) : null;
    const elementId = body.elementId ? String(body.elementId).slice(0, 255) : null;
    const elementText = body.elementText ? String(body.elementText).slice(0, 1000) : null;
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    await db.insert(behavioralEvents).values({
      id,
      sessionId,
      eventType,
      path,
      sectionName,
      elementId,
      elementText,
      scrollDepth: typeof body.scrollDepth === "number" ? body.scrollDepth : null,
      dwellTimeMs: typeof body.dwellTimeMs === "number" ? body.dwellTimeMs : null,
      ipAddress,
      userAgent,
      payload: body.payload && typeof body.payload === "object" ? (body.payload as Record<string, unknown>) : {},
    });

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
