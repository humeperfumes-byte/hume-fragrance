import { NextResponse } from "next/server";
import { db } from "@/db";
import { behavioralEvents, sessionIntelligence, sectionAttribution } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// ── Intent Scoring Weights ──────────────────────────────────
const INTENT_WEIGHTS: Record<string, number> = {
  page_view: 2,
  scroll_10: 1,
  scroll_25: 3,
  scroll_50: 8,
  scroll_75: 12,
  scroll_90: 18,
  scroll_100: 22,
  section_view_hero: 1,
  section_view_collection: 8,
  section_view_hume_special: 10,
  section_view_bestsellers: 10,
  section_view_kit_pack: 12,
  section_view_refill: 8,
  section_view_reviews: 15,
  section_view_faq: 6,
  section_view_craft: 4,
  section_view_about: 3,
  section_view_journal: 4,
  section_view_seo_teaser: 2,
  click: 5,
  hover: 3,
  form_focus: 15, // Starting to fill a form = high intent
  section_dwell: 0, // Handled dynamically below
};

// ── High-intent sections (viewing these = buying signal) ────
const HIGH_INTENT_SECTIONS = new Set(["collection", "bestsellers", "hume_special", "kit_pack", "reviews"]);

// ── Abandonment cause analysis signals ──────────────────────
const ABANDONMENT_SIGNALS: Record<string, { cause: string; weight: number }> = {
  section_view_faq: { cause: "trust_concerns", weight: 15 },
  section_view_refill: { cause: "price_sensitivity", weight: 10 },
  scroll_100: { cause: "comparison_shopping", weight: 20 },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, events } = body;

    if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

    // Support both batched events and legacy single events
    const eventList: Array<{
      eventType: string;
      path?: string;
      scrollDepth?: number;
      sectionName?: string;
      elementId?: string;
      elementText?: string;
      dwellTimeMs?: number;
      payload?: Record<string, unknown>;
    }> = Array.isArray(events) ? events : body.eventType ? [body] : [];

    if (eventList.length === 0) return NextResponse.json({ error: "No events" }, { status: 400 });

    const ipAddress = req.headers.get("x-forwarded-for") || "0.0.0.0";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // ── 1. Batch-insert all raw events ──────────────────────
    const eventRows = eventList.map((evt) => ({
      id: randomUUID(),
      sessionId,
      eventType: evt.eventType,
      path: evt.path || null,
      scrollDepth: evt.scrollDepth || null,
      sectionName: evt.sectionName || null,
      elementId: evt.elementId || null,
      elementText: evt.elementText || null,
      dwellTimeMs: evt.dwellTimeMs || null,
      ipAddress,
      userAgent,
      payload: evt.payload || {},
      createdAt: new Date(),
    }));

    await db.insert(behavioralEvents).values(eventRows);

    // ── 2. Calculate cumulative intent & risk from batch ────
    let totalIntentGain = 0;
    let exitIntentDetected = false;
    const abandonmentCauses = new Map<string, number>();
    let latestSection: string | null = null;
    let hasFormInteraction = false;

    for (const evt of eventList) {
      const { eventType, scrollDepth, sectionName, dwellTimeMs } = evt;

      // Intent scoring
      if (eventType === "scroll" && scrollDepth) {
        totalIntentGain += INTENT_WEIGHTS[`scroll_${scrollDepth}`] || 0;
        // Check abandonment signals
        const signalKey = `scroll_${scrollDepth}`;
        if (ABANDONMENT_SIGNALS[signalKey]) {
          const sig = ABANDONMENT_SIGNALS[signalKey];
          abandonmentCauses.set(sig.cause, (abandonmentCauses.get(sig.cause) || 0) + sig.weight);
        }
      } else if (eventType === "section_view" && sectionName) {
        totalIntentGain += INTENT_WEIGHTS[`section_view_${sectionName}`] || 3;
        latestSection = sectionName;
        // Check abandonment signals
        const signalKey = `section_view_${sectionName}`;
        if (ABANDONMENT_SIGNALS[signalKey]) {
          const sig = ABANDONMENT_SIGNALS[signalKey];
          abandonmentCauses.set(sig.cause, (abandonmentCauses.get(sig.cause) || 0) + sig.weight);
        }
      } else if (eventType === "section_dwell" && dwellTimeMs) {
        // Long dwell on high-intent sections = very positive
        if (sectionName && HIGH_INTENT_SECTIONS.has(sectionName)) {
          totalIntentGain += Math.min(15, Math.round(dwellTimeMs / 2000)); // +1 per 2s, max 15
        } else {
          totalIntentGain += Math.min(5, Math.round(dwellTimeMs / 3000)); // +1 per 3s, max 5
        }
        latestSection = sectionName || latestSection;
      } else if (eventType === "click") {
        totalIntentGain += INTENT_WEIGHTS["click"];
      } else if (eventType === "hover") {
        totalIntentGain += INTENT_WEIGHTS["hover"];
      } else if (eventType === "form_focus") {
        totalIntentGain += INTENT_WEIGHTS["form_focus"];
        hasFormInteraction = true;
      } else if (eventType === "exit_intent") {
        exitIntentDetected = true;
        abandonmentCauses.set("exit_intent", (abandonmentCauses.get("exit_intent") || 0) + 40);
      } else if (eventType === "page_view") {
        totalIntentGain += INTENT_WEIGHTS["page_view"];
      }
    }

    // ── 3. Determine top abandonment cause ──────────────────
    let topAbandonmentCause: string | null = null;
    let maxCauseWeight = 0;
    for (const [cause, weight] of abandonmentCauses) {
      if (weight > maxCauseWeight) {
        maxCauseWeight = weight;
        topAbandonmentCause = cause;
      }
    }

    // ── 4. Update Session Intelligence ──────────────────────
    const existing = await db
      .select()
      .from(sessionIntelligence)
      .where(eq(sessionIntelligence.sessionId, sessionId))
      .limit(1);

    if (existing.length > 0) {
      const intel = existing[0];
      const prevScore = intel.intentScore || 0;
      const newScore = Math.min(100, prevScore + totalIntentGain);

      // Abandonment risk calculation
      let newRisk = intel.abandonmentRisk || 0;
      if (exitIntentDetected) {
        newRisk = Math.min(100, newRisk + 40);
      } else {
        // Engagement reduces risk
        newRisk = Math.max(0, newRisk - Math.round(totalIntentGain / 3));
      }

      // Predict next action
      let predictedAction = "browse";
      if (hasFormInteraction || newScore >= 75) {
        predictedAction = "checkout";
      } else if (exitIntentDetected || newRisk >= 70) {
        predictedAction = "exit";
      } else if (newScore >= 40) {
        predictedAction = "add_to_cart";
      }

      await db
        .update(sessionIntelligence)
        .set({
          intentScore: newScore,
          abandonmentRisk: newRisk,
          predictedNextAction: predictedAction,
          topAbandonmentCause: topAbandonmentCause || intel.topAbandonmentCause,
          totalInteractions: (intel.totalInteractions || 0) + eventList.length,
          currentSection: latestSection || intel.currentSection,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(sessionIntelligence.sessionId, sessionId));
    } else {
      let predictedAction = "browse";
      if (hasFormInteraction) predictedAction = "checkout";
      else if (exitIntentDetected) predictedAction = "exit";
      else if (totalIntentGain >= 40) predictedAction = "add_to_cart";

      await db.insert(sessionIntelligence).values({
        id: randomUUID(),
        sessionId,
        intentScore: Math.min(100, totalIntentGain),
        abandonmentRisk: exitIntentDetected ? 40 : 0,
        predictedNextAction: predictedAction,
        topAbandonmentCause: topAbandonmentCause,
        totalInteractions: eventList.length,
        currentSection: latestSection,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // ── 5. Update Section Attribution ───────────────────────
    const sectionUpdates = new Map<string, { views: number; interactions: number; path: string }>();

    for (const evt of eventList) {
      if (!evt.sectionName || !evt.path) continue;
      const key = `${evt.path}_${evt.sectionName}`;
      const current = sectionUpdates.get(key) || { views: 0, interactions: 0, path: evt.path };

      if (evt.eventType === "section_view") current.views++;
      if (evt.eventType === "click" || evt.eventType === "hover") current.interactions++;

      sectionUpdates.set(key, current);
    }

    if (sectionUpdates.size > 0) {
      const insertData = Array.from(sectionUpdates.entries()).map(([key, data]) => {
        const sectionName = key.split("_").slice(1).join("_"); // Remove path prefix
        return {
          id: key,
          path: data.path,
          sectionName,
          views: data.views,
          interactions: data.interactions,
          attributionScore: "0",
        };
      });

      await db
        .insert(sectionAttribution)
        .values(insertData)
        .onConflictDoUpdate({
          target: [sectionAttribution.id],
          set: {
            views: sql`${sectionAttribution.views} + EXCLUDED.views`,
            interactions: sql`${sectionAttribution.interactions} + EXCLUDED.interactions`,
            // Calculate attribution score: (interactions / views) * 10, capped at 10
            attributionScore: sql`LEAST(10, ROUND(
              CASE
                WHEN (${sectionAttribution.views} + EXCLUDED.views) > 0
                THEN ((${sectionAttribution.interactions} + EXCLUDED.interactions)::numeric / (${sectionAttribution.views} + EXCLUDED.views)::numeric) * 10
                ELSE 0
              END, 2
            ))`,
            updatedAt: new Date(),
          },
        });
    }

    return NextResponse.json({ ok: true, processed: eventList.length });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
