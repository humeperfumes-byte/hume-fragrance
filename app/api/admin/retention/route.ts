import { NextRequest, NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/admin-auth";
import { runAnalyticsRetentionCleanup } from "@/lib/analytics-retention";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await runAnalyticsRetentionCleanup();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Admin retention cleanup failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to clean analytics rows" },
      { status: 500 },
    );
  }
}
