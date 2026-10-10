import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { requireCheckoutSession, checkoutFailure } from "@/lib/secure-checkout";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { CHECKOUT_EVENTS, EXIT_REASONS, appendCheckoutActivity, type ExitReason } from "@/lib/checkout-activity";
const inputSchema = z.object({ event: z.enum(CHECKOUT_EVENTS), reason: z.string().refine(value => Object.hasOwn(EXIT_REASONS, value)).optional() }).strict().refine(value => value.event === "reason_given" ? !!value.reason : !value.reason);
export async function POST(request: NextRequest) {
  try {
    const { session } = await requireCheckoutSession(request);
    const input = z.union([inputSchema, z.object({ events: z.array(inputSchema).min(1).max(20) }).strict()]).parse(await readBoundedJson(request, 2048));
    const events = "events" in input ? input.events : [input];
    await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.id}))`);
      const [draft] = await tx.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id)).limit(1);
      if (!draft) return;
      const previous = draft.pricingBreakdown || {};
      const activity = events.reduce((activity, event) => appendCheckoutActivity(activity, { event: event.event, at: new Date().toISOString(), ...(event.reason ? { reason: event.reason as ExitReason } : {}) }), previous.checkoutActivity);
      await tx.update(checkoutDrafts).set({ pricingBreakdown: { ...previous, checkoutActivity: activity } }).where(eq(checkoutDrafts.id, draft.id));
    });
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return checkoutFailure(error); }
}
