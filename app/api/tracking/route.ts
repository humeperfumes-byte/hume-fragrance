import { NextRequest, NextResponse } from "next/server";
import { lookupPublicTrackingResult } from "@/lib/tracking/public-lookup";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { trackingNumber?: unknown };
    const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber : "";

    if (!trackingNumber.trim()) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 });
    }

    const result = await lookupPublicTrackingResult(trackingNumber);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Tracking failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Tracking is temporarily unavailable",
      },
      { status: 502 },
    );
  }
}
