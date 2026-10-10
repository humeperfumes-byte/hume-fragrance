import { errorMonitoringConfigured } from "@/lib/checkout-settings";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SAFE_ERROR_CODES } from "@/lib/safe-error-monitoring";
import { reportServerError } from "@/lib/server-error-monitoring";
const inputSchema = z.object({ code: z.enum(SAFE_ERROR_CODES) }).strict();
let windowStart = 0;
let reports = 0;
export async function POST(request: NextRequest) {
  if (!errorMonitoringConfigured()) return new NextResponse(null, { status: 204 });
  // Reject other origins and cap the process-wide report volume without storing IPs.
  if (request.headers.get("origin") !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  if (Date.now() - windowStart > 60000) { windowStart = Date.now(); reports = 0; }
  if (++reports > 60) return new NextResponse(null, { status: 429 });
  try {
    const parsed = inputSchema.safeParse(await readBoundedJson(request, 150));
    if (!parsed.success) return new NextResponse(null, { status: 400 });
  await reportServerError(parsed.data.code);
    return new NextResponse(null, { status: 204 });
  } catch { return new NextResponse(null, { status: 400 }); }
}
