import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { secureCheckoutEnabled, requireCheckoutSession, checkoutFailure } from "@/lib/secure-checkout";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (secureCheckoutEnabled()) {
      const { session } = await requireCheckoutSession(request);
      if (sessionId !== session.id) return NextResponse.json({ overrideTotal: null }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
    }

    if (!sessionId) {
      return NextResponse.json({ overrideTotal: null });
    }

    const drafts = await db
      .select({ pricingBreakdown: checkoutDrafts.pricingBreakdown })
      .from(checkoutDrafts)
      .where(eq(checkoutDrafts.sessionId, sessionId))
      .limit(1);

    const draft = drafts[0];
    if (!draft || !draft.pricingBreakdown) {
      return NextResponse.json({ overrideTotal: null });
    }

    const overrideTotal = draft.pricingBreakdown.overrideTotal;
    return NextResponse.json({
      overrideTotal: typeof overrideTotal === "number" ? overrideTotal : null,
    });
  } catch (error) {
    if (secureCheckoutEnabled()) return checkoutFailure(error);
    console.error("Error fetching checkout override:", error);
    return NextResponse.json({ overrideTotal: null });
  }
}
