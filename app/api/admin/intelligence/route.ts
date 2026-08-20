import { NextRequest, NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/admin-auth";
import {
  generateStoredAiReport,
  getAiReportState,
  serializeAiReport,
} from "@/lib/ai/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const history = Number(new URL(request.url).searchParams.get("history") || 0);
    return NextResponse.json(await getAiReportState(Number.isFinite(history) ? history : 0));
  } catch (error) {
    console.error("Admin AI report state error:", error);
    return NextResponse.json({ error: "Unable to load AI analytics reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const report = await generateStoredAiReport("manual");
    return NextResponse.json({ ok: true, report: serializeAiReport(report) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI report generation failed";
    const status = message.includes("wait")
      ? 429
      : message.includes("already being generated")
        ? 409
        : message.includes("Configure") || message.includes("disabled")
          ? 503
          : 502;
    console.error("Admin AI report generation error:", error);
    return NextResponse.json({ error: message }, { status });
  }
}
