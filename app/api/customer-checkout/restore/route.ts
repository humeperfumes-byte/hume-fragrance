import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { customerAccessLinks, checkoutDrafts, orders } from "@/db/schema";
import { resolveCustomerLink } from "@/lib/customer-access-links";
import { hashCustomerToken } from "@/lib/customer-access-token";
import { freshResumeCatalogue } from "@/lib/fresh-resume-catalogue";
import { buildResumeCart } from "@/lib/checkout-resume-cart";
import { reportServerError } from "@/lib/server-error-monitoring";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { z } from "zod";
const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Unable to restore checkout" }, { status: 403, headers });
  try {
    const raw = z.object({ token: z.string().length(43) }).strict().safeParse(await readBoundedJson(request, 150));
    const token = raw.success ? raw.data.token : "";
    const hash = hashCustomerToken(token);
    const id = hash ? await resolveCustomerLink(token, "checkout") : null;
    if (!id) return NextResponse.json({ error: "This checkout link is unavailable or has already been used." }, { status: 404, headers });
    const [draft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.id, id)).limit(1);
    if (!draft) return NextResponse.json({ error: "Checkout unavailable" }, { status: 404, headers });
    const [existing] = await db.select({ id: orders.id }).from(orders).where(eq(orders.sessionId, draft.sessionId)).limit(1);
    if (existing) return NextResponse.json({ error: "This checkout already has an order. Please contact HUME." }, { status: 409, headers });
    const restored = buildResumeCart(draft.cartSnapshot, await freshResumeCatalogue());
    if (restored.issues.length) return NextResponse.json({ error: restored.issues[0] }, { status: 409, headers });
    // Consume the restore capability once, preventing simultaneous restores from this link.
    const [consumed] = await db.update(customerAccessLinks).set({ revokedAt: new Date() }).where(and(eq(customerAccessLinks.tokenHash, hash!), eq(customerAccessLinks.scope, "checkout"), isNull(customerAccessLinks.revokedAt), gt(customerAccessLinks.expiresAt, new Date()))).returning({ id: customerAccessLinks.id });
    if (!consumed) return NextResponse.json({ error: "This checkout link has already been used. Please contact HUME for a fresh link." }, { status: 409, headers });
    return NextResponse.json({ items: restored.items }, { headers });
  } catch { await reportServerError("CHECKOUT_RESUME_FAILED"); return NextResponse.json({ error: "Could not restore checkout. Your existing cart has not been changed." }, { status: 500, headers }); }
}
