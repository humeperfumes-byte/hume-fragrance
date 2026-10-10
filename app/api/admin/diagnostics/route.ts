import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { recentSafeErrors } from "@/lib/server-error-monitoring";
import { db } from "@/db";
import { safeDiagnostics } from "@/db/schema";
import { desc } from "drizzle-orm";
export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  const events = await db.select().from(safeDiagnostics).orderBy(desc(safeDiagnostics.occurredAt)).limit(100).catch(() => recentSafeErrors());
  return NextResponse.json({ enabled: process.env.ENABLE_ERROR_MONITORING === "true", alertsConfigured: !!process.env.ERROR_ALERT_WEBHOOK_URL, events, note: "Privacy-safe diagnostics are retained for 30 days." }, { headers: { "Cache-Control": "private, no-store" } });
}
