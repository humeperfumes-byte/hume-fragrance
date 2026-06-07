import { db } from "@/db";
import { sql } from "drizzle-orm";

export const ANALYTICS_RETENTION_DAYS = 30;

type RetentionResult = {
  retentionDays: number;
  cutoff: string;
  deleted: {
    cartEvents: number;
    couponCodeEvents: number;
    behavioralEvents: number;
    sessionIntelligence: number;
  };
};

function readCount(result: unknown): number {
  const rows = Array.isArray(result)
    ? result
    : result && typeof result === "object" && "rows" in result
      ? (result as { rows: unknown[] }).rows
      : [];
  const [row] = rows as Array<{ deleted_count?: number | string | null }>;
  return Number(row?.deleted_count ?? 0);
}

async function deleteOlderThan(tableName: string, columnName: string, cutoffIso: string) {
  const result = await db.execute(sql`
    with deleted as (
      delete from ${sql.identifier(tableName)}
      where ${sql.identifier(columnName)} < ${cutoffIso}::timestamp
      returning 1
    )
    select count(*)::int as deleted_count from deleted
  `);

  return readCount(result);
}

export async function runAnalyticsRetentionCleanup(
  retentionDays = ANALYTICS_RETENTION_DAYS,
): Promise<RetentionResult> {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString();

  const [cartEvents, couponCodeEvents, behavioralEvents, sessionIntelligence] = await Promise.all([
    deleteOlderThan("cart_events", "created_at", cutoffIso),
    deleteOlderThan("coupon_code_events", "created_at", cutoffIso),
    deleteOlderThan("behavioral_events", "created_at", cutoffIso),
    deleteOlderThan("session_intelligence", "updated_at", cutoffIso),
  ]);

  return {
    retentionDays,
    cutoff: cutoffIso,
    deleted: {
      cartEvents,
      couponCodeEvents,
      behavioralEvents,
      sessionIntelligence,
    },
  };
}
