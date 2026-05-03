import { NextResponse } from "next/server";
import { db } from "@/db";
import { behavioralEvents, sessionIntelligence, sectionAttribution } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Intent Scoring Weights
const WEIGHTS: Record<string, number> = {
  "page_view": 2,
  "scroll_10": 2,
  "scroll_25": 5,
  "scroll_50": 10,
  "scroll_75": 15,
  "scroll_90": 20,
  "scroll_100": 25,
  "section_view_hero": 2,
  "section_view_products": 10,
  "section_view_reviews": 15,
  "section_view_notes": 12,
  "click": 5,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, eventType, path, scrollDepth, sectionName, elementId, elementText } = body;

    if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

    const eventId = randomUUID();
    const ipAddress = req.headers.get("x-forwarded-for") || "0.0.0.0";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 1. Record the Raw Event
    await db.insert(behavioralEvents).values({
      id: eventId,
      sessionId,
      eventType,
      path,
      scrollDepth,
      sectionName,
      elementId,
      elementText,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    });

    // 2. Calculate Intent & Risk
    let intentGain = 0;
    let abandonmentRisk = 0;
    let predictedNextAction = "browse";
    let topAbandonmentCause = null;

    if (eventType === "scroll") {
      intentGain = WEIGHTS[`scroll_${scrollDepth}`] || 0;
    } else if (eventType === "section_view") {
      intentGain = WEIGHTS[`section_view_${sectionName}`] || 2;
    } else if (eventType === "click") {
      intentGain = WEIGHTS["click"];
    } else if (eventType === "exit_intent") {
      abandonmentRisk = 90;
      predictedNextAction = "exit";
      topAbandonmentCause = "undetermined";
    }

    // 3. Update Session Intelligence
    const existingIntelligence = await db.select().from(sessionIntelligence).where(eq(sessionIntelligence.sessionId, sessionId)).limit(1);

    if (existingIntelligence.length > 0) {
      const intel = existingIntelligence[0];
      const newScore = Math.min(100, (intel.intentScore || 0) + intentGain);
      
      await db.update(sessionIntelligence)
        .set({
          intentScore: newScore,
          abandonmentRisk: eventType === "exit_intent" ? 90 : Math.max(0, (intel.abandonmentRisk || 0) - (intentGain / 2)),
          predictedNextAction: eventType === "exit_intent" ? "exit" : (newScore > 70 ? "checkout" : "browse"),
          totalInteractions: (intel.totalInteractions || 0) + 1,
          currentSection: sectionName || intel.currentSection,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sessionIntelligence.sessionId, sessionId));
    } else {
      await db.insert(sessionIntelligence).values({
        id: randomUUID(),
        sessionId,
        intentScore: intentGain,
        abandonmentRisk: abandonmentRisk,
        predictedNextAction: "browse",
        totalInteractions: 1,
        currentSection: sectionName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 4. Update Section Attribution (Async-style)
    if (sectionName) {
      await db.insert(sectionAttribution)
        .values({
          id: `${path}_${sectionName}`,
          path,
          sectionName,
          views: 1,
          interactions: eventType === "click" ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [sectionAttribution.id],
          set: {
            views: sql`${sectionAttribution.views} + 1`,
            interactions: eventType === "click" ? sql`${sectionAttribution.interactions} + 1` : sql`${sectionAttribution.interactions}`,
            updatedAt: new Date(),
          }
        });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
