import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { readCheckoutActivity } from "@/lib/checkout-activity";
export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId || sessionId.length > 255) return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  try {
    const [draft] = await db.select({ breakdown: checkoutDrafts.pricingBreakdown }).from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, sessionId)).limit(1);
    return NextResponse.json({ activity: readCheckoutActivity(draft?.breakdown?.checkoutActivity) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Activity temporarily unavailable" }, { status: 503 }); }
}
