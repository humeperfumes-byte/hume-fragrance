import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, checkoutDrafts, customerAccessLinks } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { createCustomerToken, hashCustomerToken } from "@/lib/customer-access-token";
import { customerLinksEnabled } from "@/lib/customer-access-links";
import { checkoutCanContinue } from "@/lib/checkout-continuation";
import { deriveOrderToken } from "@/lib/secure-checkout-capability";
import { reportServerError } from "@/lib/server-error-monitoring";
const inputSchema = z.object({ scope: z.enum(["order", "checkout"]), resourceId: z.string().min(1).max(255) }).strict();
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const input = inputSchema.parse(await request.json());
    if (!customerLinksEnabled(input.scope)) return NextResponse.json({ error: "Customer links are not enabled yet" }, { status: 503 });
    let pendingOrderId: string | null = null;
    if (input.scope === "order") {
      const [resource] = await db.select({ id: orders.id, country: orders.country }).from(orders).where(eq(orders.id, input.resourceId)).limit(1);
      if (!resource) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (resource.country && resource.country !== "IN") return NextResponse.json({ error: "Customer order links currently support INR orders in India only" }, { status: 400 });
    } else {
      const [resource] = await db.select({ sessionId: checkoutDrafts.sessionId, country: checkoutDrafts.country }).from(checkoutDrafts).where(eq(checkoutDrafts.id, input.resourceId)).limit(1);
      if (!resource) return NextResponse.json({ error: "Checkout not found" }, { status: 404 });
      if (resource.country && resource.country !== "IN") return NextResponse.json({ error: "Resume checkout links currently support India only" }, { status: 400 });
      const [converted] = await db.select().from(orders).where(eq(orders.sessionId, resource.sessionId)).orderBy(desc(orders.createdAt)).limit(1);
      if (converted && (!checkoutCanContinue(converted) || converted.status === "payment_authorized" || ["creating", "switching", "payment_review", "payment_mismatch", "multiple_captures"].includes(converted.paymentSyncStatus || ""))) return NextResponse.json({ error: "Review this order in Orders before sending a payment reminder." }, { status: 409 });
      pendingOrderId = converted?.id || null;
    }
    const { token, hash } = createCustomerToken();
    const expiresAt = new Date(Date.now() + (input.scope === "order" ? 30 : 7) * 86400000);
    const id = randomUUID();
    await db.insert(customerAccessLinks).values([{ id, tokenHash: hash, scope: input.scope, resourceId: input.resourceId, expiresAt }, ...(pendingOrderId ? [{ id: randomUUID(), tokenHash: hashCustomerToken(deriveOrderToken(token))!, scope: "order" as const, resourceId: pendingOrderId, expiresAt }] : [])]);
    // Return a relative path; the admin browser resolves the current origin.
    return NextResponse.json({ id, path: `/${input.scope}/${token}${input.scope === "checkout" ? "?resume=1" : ""}`, expiresAt }, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid link request" }, { status: 400 });
    await reportServerError("CUSTOMER_LINK_FAILED");
    return NextResponse.json({ error: "Could not create customer link" }, { status: 500 });
  }
}
export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminToken(request); if (unauthorized) return unauthorized;
  if (request.headers.get("origin") && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const input = z.object({ id: z.string().uuid() }).strict().safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Invalid link" }, { status: 400 });
  try {
    await db.update(customerAccessLinks).set({ revokedAt: new Date() }).where(eq(customerAccessLinks.id, input.data.id));
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    await reportServerError("CUSTOMER_LINK_FAILED");
    return NextResponse.json({ error: "Could not revoke customer link" }, { status: 500 });
  }
}
