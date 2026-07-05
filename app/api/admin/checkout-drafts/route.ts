import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

const leadUpdateSchema = z.object({
  id: z.string().min(1).max(255),
  leadStatus: z.enum(["new", "contacted", "replied", "converted", "lost"]).optional(),
  leadNotes: z.string().max(10000).optional().nullable(),
  markContacted: z.boolean().optional(),
  nextFollowUpAt: z.string().datetime().optional().nullable(),
  overrideTotal: z.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(24 * 90, Math.max(1, Number(searchParams.get("hours") || "720")));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const drafts = await db
      .select()
      .from(checkoutDrafts)
      .where(and(gte(checkoutDrafts.updatedAt, since)))
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(200);

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("admin checkout-drafts fetch error:", error);
    return NextResponse.json({ error: "Failed to load checkout drafts" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const data = leadUpdateSchema.parse(await request.json());
    const nextFollowUpAt = data.nextFollowUpAt ? new Date(data.nextFollowUpAt) : null;
    const shouldUpdateContactedAt = data.markContacted || data.leadStatus === "contacted";

    const existing = await db
      .select({ pricingBreakdown: checkoutDrafts.pricingBreakdown })
      .from(checkoutDrafts)
      .where(eq(checkoutDrafts.id, data.id))
      .limit(1);

    const pricingBreakdown = existing[0]?.pricingBreakdown || {};
    const updatedPricingBreakdown = {
      ...pricingBreakdown,
      overrideTotal: data.overrideTotal,
    };

    await db
      .update(checkoutDrafts)
      .set({
        leadStatus: data.leadStatus,
        leadNotes: data.leadNotes ?? undefined,
        lastContactedAt: shouldUpdateContactedAt ? new Date() : undefined,
        nextFollowUpAt:
          data.nextFollowUpAt === undefined ? undefined : nextFollowUpAt,
        pricingBreakdown: updatedPricingBreakdown,
        updatedAt: new Date(),
      })
      .where(eq(checkoutDrafts.id, data.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin checkout-drafts update error:", error);
    return NextResponse.json({ error: "Failed to update checkout lead" }, { status: 500 });
  }
}
