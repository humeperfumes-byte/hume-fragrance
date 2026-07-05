import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

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
    console.error("Error fetching checkout override:", error);
    return NextResponse.json({ overrideTotal: null });
  }
}
