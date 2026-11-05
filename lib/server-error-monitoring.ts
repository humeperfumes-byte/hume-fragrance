import { errorMonitoringConfigured } from "@/lib/checkout-settings";
import "server-only";
import { deliverSafeError, persistSafeErrorWithLegacyFallback, shouldRecordSafeError, type SafeErrorCode, type SafeErrorEvent, type SafeErrorContext } from "./safe-error-monitoring";
import { db } from "@/db";
import { safeDiagnostics } from "@/db/schema";
import { lt, sql } from "drizzle-orm";

const recent: SafeErrorEvent[] = [];
const lastReport = new Map<string, number>();
let lastCleanup = 0;
export function reportServerError(code: SafeErrorCode, context?: SafeErrorContext) {
  if (!errorMonitoringConfigured() || !shouldRecordSafeError(lastReport, code, context)) return;
  return deliverSafeError(code, errorMonitoringConfigured(), async event => {
    recent.push(event);
    if (recent.length > 100) recent.shift();
    console.error("HUME_SAFE_ERROR", JSON.stringify(event));
    try {
      // Keep legacy logging working if code reaches an unmigrated database.
      await persistSafeErrorWithLegacyFallback(event,
        async () => db.insert(safeDiagnostics).values({ reference: event.reference, code: event.code, occurredAt: new Date(event.occurredAt), details: event.details || {} }).onConflictDoNothing(),
        async () => db.execute(sql`INSERT INTO safe_diagnostics (reference, code, occurred_at) VALUES (${event.reference}, ${event.code}, ${event.occurredAt}::timestamp) ON CONFLICT (reference) DO NOTHING`));
      if (Date.now() - lastCleanup > 3600000) {
        lastCleanup = Date.now();
        await db.delete(safeDiagnostics).where(lt(safeDiagnostics.occurredAt, new Date(Date.now() - 30 * 86400000)));
      }
    } catch { /* Diagnostic storage failures must never interrupt checkout. */ }
    const destination = process.env.ERROR_ALERT_WEBHOOK_URL;
    if (destination?.startsWith("https://")) {
      try { await fetch(destination, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event), signal: AbortSignal.timeout(3000), redirect: "error" }); } catch { /* Alerts cannot change payment outcomes. */ }
    }
  }, context);
}
export function recentSafeErrors() { return [...recent]; }
