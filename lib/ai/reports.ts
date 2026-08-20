import "server-only";

import { randomUUID } from "node:crypto";
import { desc, eq, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { aiAnalyticsReports } from "@/db/schema";
import { AI_CONFIG, getAiRuntimeStatus } from "@/lib/ai/config";
import { generateAiAnalyticsReport, getProviderAttempts } from "@/lib/ai/provider";
import { shouldReuseCompletedAiReport } from "@/lib/ai/report-policy";
import { aiAnalyticsReportSchema } from "@/lib/ai/report-schema";
import { buildAiAnalyticsSnapshot } from "@/lib/ai/snapshot";

export type AiReportTrigger = "scheduled" | "manual";

const MANUAL_COOLDOWN_MS = AI_CONFIG.cacheTtlSeconds * 1000;
const PROCESSING_STALE_MS = 10 * 60 * 1000;
const HISTORY_RETENTION_MS = 52 * 7 * 24 * 60 * 60 * 1000;

function safeError(error: unknown) {
  return (error instanceof Error ? error.message : String(error || "AI report generation failed")).slice(0, 500);
}

export function serializeAiReport(row: typeof aiAnalyticsReports.$inferSelect | null) {
  if (!row) return null;
  const parsedReport = row.report ? aiAnalyticsReportSchema.safeParse(row.report) : null;
  return {
    id: row.id,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    trigger: row.trigger,
    status: row.status,
    provider: row.provider,
    model: row.model,
    report: parsedReport?.success ? parsedReport.data : null,
    attempts: row.attempts,
    error: row.error,
    durationMs: row.durationMs,
    createdAt: row.createdAt.toISOString(),
    completedAt: row.completedAt?.toISOString() || null,
  };
}

export async function getAiReportState(historyLimit = 0) {
  const limit = Math.min(52, Math.max(0, historyLimit));
  const [latestRows, failedRows, recentRows, history] = await Promise.all([
    db
      .select()
      .from(aiAnalyticsReports)
      .where(eq(aiAnalyticsReports.status, "completed"))
      .orderBy(desc(aiAnalyticsReports.completedAt))
      .limit(1),
    db
      .select()
      .from(aiAnalyticsReports)
      .where(eq(aiAnalyticsReports.status, "failed"))
      .orderBy(desc(aiAnalyticsReports.createdAt))
      .limit(1),
    db
      .select()
      .from(aiAnalyticsReports)
      .orderBy(desc(aiAnalyticsReports.createdAt))
      .limit(1),
    limit
      ? db
          .select()
          .from(aiAnalyticsReports)
          .where(eq(aiAnalyticsReports.status, "completed"))
          .orderBy(desc(aiAnalyticsReports.completedAt))
          .limit(limit)
      : Promise.resolve([]),
  ]);

  const latest = latestRows[0] || null;
  const latestFailure = failedRows[0] || null;
  const current = recentRows[0] || null;
  const generatedAt = latest?.completedAt || latest?.createdAt || null;
  return {
    ai: getAiRuntimeStatus(),
    current: serializeAiReport(current),
    generating:
      current?.status === "processing" &&
      Date.now() - current.createdAt.getTime() < PROCESSING_STALE_MS,
    latest: serializeAiReport(latest),
    latestFailure:
      latestFailure && (!generatedAt || latestFailure.createdAt > generatedAt)
        ? serializeAiReport(latestFailure)
        : null,
    history: history.map(serializeAiReport),
    stale: !generatedAt || Date.now() - generatedAt.getTime() > 8 * 24 * 60 * 60 * 1000,
    nextScheduledFor: nextMondayAtEightIst().toISOString(),
  };
}

export async function generateStoredAiReport(trigger: AiReportTrigger) {
  const runtime = getAiRuntimeStatus();
  if (!runtime.analyticsEnabled) throw new Error("AI analytics is disabled");
  if (!runtime.ready) throw new Error("Configure Gemini or OpenRouter before generating a report");

  const now = new Date();
  const [latestRun] = await db
    .select()
    .from(aiAnalyticsReports)
    .orderBy(desc(aiAnalyticsReports.createdAt))
    .limit(1);

  if (latestRun?.status === "processing" && now.getTime() - latestRun.createdAt.getTime() < PROCESSING_STALE_MS) {
    throw new Error("An AI report is already being generated");
  }
  if (
    trigger === "manual" &&
    latestRun &&
    now.getTime() - latestRun.createdAt.getTime() < MANUAL_COOLDOWN_MS
  ) {
    const remaining = Math.max(1, Math.ceil((MANUAL_COOLDOWN_MS - (now.getTime() - latestRun.createdAt.getTime())) / 60000));
    throw new Error(`Please wait ${remaining} minute${remaining === 1 ? "" : "s"} before generating another report`);
  }

  const aggregate = await buildAiAnalyticsSnapshot(now);
  if (shouldReuseCompletedAiReport(latestRun, aggregate.inputHash, now, MANUAL_COOLDOWN_MS)) {
    return latestRun;
  }

  const id = randomUUID();
  await db.insert(aiAnalyticsReports).values({
    id,
    periodStart: aggregate.periodStart,
    periodEnd: aggregate.periodEnd,
    trigger,
    status: "processing",
    inputHash: aggregate.inputHash,
    attempts: [],
  });

  const startedAt = Date.now();
  try {
    const generated = await generateAiAnalyticsReport(aggregate.snapshot);
    const [completed] = await db
      .update(aiAnalyticsReports)
      .set({
        status: "completed",
        provider: generated.provider,
        model: generated.model,
        report: generated.report as Record<string, unknown>,
        attempts: generated.attempts,
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
        error: null,
      })
      .where(eq(aiAnalyticsReports.id, id))
      .returning();
    return completed;
  } catch (error) {
    const attempts = getProviderAttempts(error);
    await db
      .update(aiAnalyticsReports)
      .set({
        status: "failed",
        attempts,
        error: safeError(error),
        durationMs: Date.now() - startedAt,
        completedAt: new Date(),
      })
      .where(eq(aiAnalyticsReports.id, id));
    throw error;
  }
}

export async function cleanupAiReportHistory(now = new Date()) {
  const cutoff = new Date(now.getTime() - HISTORY_RETENTION_MS);
  const deleted = await db
    .delete(aiAnalyticsReports)
    .where(lt(aiAnalyticsReports.createdAt, cutoff))
    .returning({ id: aiAnalyticsReports.id });
  return deleted.length;
}

function nextMondayAtEightIst(now = new Date()) {
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day = istNow.getUTCDay();
  let daysAhead = (8 - day) % 7;
  const target = new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + daysAhead, 2, 30));
  if (target <= now) {
    daysAhead += 7;
    return new Date(Date.UTC(istNow.getUTCFullYear(), istNow.getUTCMonth(), istNow.getUTCDate() + daysAhead, 2, 30));
  }
  return target;
}

export async function hasRecentAiReport(since: Date) {
  const rows = await db
    .select({ id: aiAnalyticsReports.id })
    .from(aiAnalyticsReports)
    .where(gte(aiAnalyticsReports.createdAt, since))
    .limit(1);
  return rows.length > 0;
}
