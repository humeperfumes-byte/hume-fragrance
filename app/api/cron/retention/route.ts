import { NextRequest, NextResponse } from "next/server";

import { runAnalyticsRetentionCleanup } from "@/lib/analytics-retention";

export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return request.headers.get("user-agent")?.toLowerCase().includes("vercel-cron") ?? false;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAnalyticsRetentionCleanup();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Cron retention cleanup failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to clean analytics rows" },
      { status: 500 },
    );
  }
}
