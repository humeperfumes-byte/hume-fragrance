import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders, secureCheckoutSessions, customerAccessLinks } from "@/db/schema";
import { findAccountSession, identityFromSession, accountOrderWhere } from "@/lib/account-login";
import { CHECKOUT_ACTIVE_COOKIE, CHECKOUT_OWNER_COOKIE, ownsCheckout, deriveOrderToken } from "@/lib/secure-checkout-capability";
import { createCustomerToken, hashCustomerToken } from "@/lib/customer-access-token";
import { randomUUID } from "node:crypto";
import { checkoutCanContinue } from "@/lib/checkout-continuation";
import { secureCheckoutEnabled, checkoutFailure, CheckoutRequestError, switchSecurePaymentMode } from "@/lib/secure-checkout";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { expectedPaymentMinor } from "@/lib/secure-checkout-pricing";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    if (!secureCheckoutEnabled() || request.headers.get("origin") !== request.nextUrl.origin) throw new CheckoutRequestError("Checkout resume unavailable", 403);
    const body = z.object({ orderId: z.string().max(100), accountToken: z.string().max(512).optional(), paymentMode: z.enum(["full", "partial_cod"]).optional() }).parse(await readBoundedJson(request, 2048));
    const [session] = await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.orderId, body.orderId)).limit(1);
    if (!session) throw new CheckoutRequestError("Saved checkout unavailable", 404);
    const owner = request.cookies.get(CHECKOUT_OWNER_COOKIE)?.value;
    const owned = ownsCheckout(owner, session.ownerHash) && session.expiresAt > new Date();
    const account = !owned && body.accountToken ? await findAccountSession(body.accountToken) : null;
    const [authorized] = owned ? [true] : account ? await db.select({ id: orders.id }).from(orders).where(and(eq(orders.id, body.orderId), accountOrderWhere(identityFromSession(account)))).limit(1) : [];
    if (!authorized) throw new CheckoutRequestError("Please sign in to resume this order", 401);
    if (body.paymentMode) await switchSecurePaymentMode(session.id, body.paymentMode);
    const activeToken = request.cookies.get(CHECKOUT_ACTIVE_COOKIE)?.value;
    const capability = owned && activeToken && hashCustomerToken(activeToken) === session.tokenHash ? { token: activeToken, hash: session.tokenHash } : createCustomerToken();
    const ownerCapability = owned ? null : createCustomerToken();
    await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.id}))`);
      const [currentSession] = await tx.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.id, session.id)).for("update").limit(1);
      if (!currentSession || (owned && (!ownsCheckout(owner, currentSession.ownerHash) || currentSession.expiresAt <= new Date()))) throw new CheckoutRequestError("Please sign in to resume this order", 401);
      const [order] = await tx.select().from(orders).where(eq(orders.id, body.orderId)).for("update").limit(1);
      if (!order || !checkoutCanContinue(order)) throw new CheckoutRequestError("This order no longer needs payment", 409);
      const savedMode = /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || "") ? "partial_cod" : "full";
      if (body.paymentMode && body.paymentMode !== savedMode) {
        if (order.razorpayOrderId || order.paymentSyncStatus === "creating" || order.checkoutChannel !== "razorpay") throw new CheckoutRequestError("This order already has a saved payment request. Continue saved payment to check it before changing payment options.", 409);
        await tx.update(orders).set({ paymentMethod: body.paymentMode === "partial_cod" ? "20% Prepaid + 80% Cash on Delivery" : "Razorpay Online Payment", updatedAt: new Date() }).where(eq(orders.id, order.id));
        await tx.update(secureCheckoutSessions).set({ expectedPaymentMinor: expectedPaymentMinor(Number(order.grandTotal), body.paymentMode === "partial_cod") }).where(eq(secureCheckoutSessions.id, session.id));
      }
      await tx.update(secureCheckoutSessions).set({ tokenHash: capability.hash, ...(ownerCapability ? { ownerHash: ownerCapability.hash } : {}), expiresAt: new Date(Date.now() + 7 * 86400000), updatedAt: new Date() }).where(eq(secureCheckoutSessions.id, session.id));
      await tx.insert(customerAccessLinks).values({ id: randomUUID(), tokenHash: hashCustomerToken(deriveOrderToken(capability.token))!, scope: "order", resourceId: order.id, expiresAt: new Date(Date.now() + 30 * 86400000) }).onConflictDoNothing({ target: customerAccessLinks.tokenHash });
    });
    const response = NextResponse.json({ path: `/checkout/${capability.token}` }, { headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
    const options = { httpOnly: true, sameSite: "lax" as const, secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 7 * 86400 };
    response.cookies.set(CHECKOUT_ACTIVE_COOKIE, capability.token, options);
    if (ownerCapability) response.cookies.set(CHECKOUT_OWNER_COOKIE, ownerCapability.token, { ...options, maxAge: 30 * 86400 });
    return response;
  } catch (error) { return checkoutFailure(error); }
}
