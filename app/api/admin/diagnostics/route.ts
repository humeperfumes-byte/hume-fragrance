import { errorMonitoringConfigured } from "@/lib/checkout-settings";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { recentSafeErrors } from "@/lib/server-error-monitoring";
import { classifySafeFailure } from "@/lib/safe-error-monitoring";
import { db } from "@/db";
import { safeDiagnostics } from "@/db/schema";
import { desc } from "drizzle-orm";
export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  const events = await db.select().from(safeDiagnostics).orderBy(desc(safeDiagnostics.occurredAt)).limit(100)
    .catch(error => {
      if (classifySafeFailure(error).sqlState !== "42703") throw error;
      return db.select({ reference: safeDiagnostics.reference, code: safeDiagnostics.code, occurredAt: safeDiagnostics.occurredAt }).from(safeDiagnostics).orderBy(desc(safeDiagnostics.occurredAt)).limit(100);
    })
    .catch(() => recentSafeErrors());
  return NextResponse.json({ enabled: errorMonitoringConfigured(), alertsConfigured: !!process.env.ERROR_ALERT_WEBHOOK_URL, events, note: "Privacy-safe diagnostics are retained for 30 days." }, { headers: { "Cache-Control": "private, no-store" } });
}
