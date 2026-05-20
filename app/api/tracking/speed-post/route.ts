import { NextRequest, NextResponse } from "next/server";
import { trackSpeedPostConsignment } from "@/lib/tracking/india-post";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { trackingNumber?: unknown };
    const trackingNumber = typeof body.trackingNumber === "string" ? body.trackingNumber : "";

    if (!trackingNumber.trim()) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 });
    }

    const result = await trackSpeedPostConsignment(trackingNumber);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("Speed Post tracking failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Speed Post tracking is temporarily unavailable",
      },
      { status: 502 },
    );
  }
}
