import { NextRequest, NextResponse } from "next/server";

import { generateStoredAiReport, serializeAiReport } from "@/lib/ai/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await generateStoredAiReport("scheduled");
    return NextResponse.json({ ok: true, report: serializeAiReport(report) });
  } catch (error) {
    console.error("Weekly AI analytics cron failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "AI report generation failed" },
      { status: 500 },
    );
  }
}
