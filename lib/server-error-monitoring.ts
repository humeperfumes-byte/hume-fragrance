import "server-only";
import { deliverSafeError, type SafeErrorCode, type SafeErrorEvent } from "./safe-error-monitoring";
import { db } from "@/db";
import { safeDiagnostics } from "@/db/schema";
import { lt } from "drizzle-orm";

const recent: SafeErrorEvent[] = [];
const lastReport = new Map<SafeErrorCode, number>();
let lastCleanup = 0;
export function reportServerError(code: SafeErrorCode) {
  if (Date.now() - (lastReport.get(code) || 0) < 5000) return;
  lastReport.set(code, Date.now());
  return deliverSafeError(code, process.env.ENABLE_ERROR_MONITORING === "true", async event => {
    recent.push(event);
    if (recent.length > 100) recent.shift();
    console.error("HUME_SAFE_ERROR", JSON.stringify(event));
    try {
      await db.insert(safeDiagnostics).values({ reference: event.reference, code: event.code, occurredAt: new Date(event.occurredAt) });
      if (Date.now() - lastCleanup > 3600000) {
        lastCleanup = Date.now();
        await db.delete(safeDiagnostics).where(lt(safeDiagnostics.occurredAt, new Date(Date.now() - 30 * 86400000)));
      }
    } catch { /* Diagnostic storage failures must never interrupt checkout. */ }
    const destination = process.env.ERROR_ALERT_WEBHOOK_URL;
    if (destination?.startsWith("https://")) {
      try { await fetch(destination, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(event), signal: AbortSignal.timeout(3000), redirect: "error" }); } catch { /* Alerts cannot change payment outcomes. */ }
    }
  });
}
export function recentSafeErrors() { return [...recent]; }
