// Run with: node --conditions=react-server --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-secure-checkout.ts
// Uses generated fixture IDs only; provider responses are mocked and fixture rows are removed.
import { config } from "dotenv";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
config({ path: ".env.local", quiet: true }); config({ path: ".env", quiet: true });
// This is a persistent local verification process, not a serverless deployment.
if (process.env.DATABASE_URL) {
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (databaseUrl.port === "6543" && databaseUrl.hostname.endsWith(".pooler.supabase.com")) { databaseUrl.port = "5432"; process.env.DATABASE_URL = databaseUrl.toString(); }
}
Object.assign(process.env, { ENABLE_SECURE_CHECKOUT: "true", ENABLE_ERROR_MONITORING: "false", RAZORPAY_KEY_ID: "test_local_only", RAZORPAY_KEY_SECRET: "test_local_only_secret", NODE_ENV: "test" });
async function main() {
  const { NextRequest } = await import("next/server");
  const { GET: reconcileCron } = await import("../app/api/cron/razorpay-reconciliation/route");
  const originalCronSecret = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    assert.equal((await reconcileCron(new NextRequest("http://localhost:3002/api/cron/razorpay-reconciliation", { headers: { "user-agent": "vercel-cron/1.0" } }))).status, 401, "A spoofed cron header must not authorize reconciliation");
    process.env.CRON_SECRET = "fixture-cron-secret";
    assert.equal((await reconcileCron(new NextRequest("http://localhost:3002/api/cron/razorpay-reconciliation", { headers: { authorization: "Bearer wrong-secret" } }))).status, 401);
  } finally {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = originalCronSecret;
  }
  const { db } = await import("../db");
  const { orders, secureCheckoutSessions, customerAccessLinks, checkoutDrafts, siteSettings } = await import("../db/schema");
  const { eq, inArray } = await import("drizzle-orm");
  const { startSecureCheckout, saveSecureDraft, saveSecureOrder, createSecurePayment, verifySecurePayment, recoverSecurePayment, activeSecureCheckout } = await import("../lib/secure-checkout");
  const { POST: accountLookup } = await import("../app/api/account/route");
  const { POST: resumeAccountCheckout } = await import("../app/api/account/checkout/resume/route");
  const { POST: recordCheckoutActivity } = await import("../app/api/checkout-session/activity/route");
  const { freshResumeCatalogue } = await import("../lib/fresh-resume-catalogue");
  const { normalizeAdminControls, ADMIN_CONTROLS_KEY } = await import("../lib/admin-settings");
  const { expectedPaymentMinor, priceSecureCart } = await import("../lib/secure-checkout-pricing");
  const product = (await freshResumeCatalogue()).find(p => p.priceCurrency === "INR" && !p.badges?.soldOut && !p.badges?.comingSoon && p.price >= 100 && p.id !== "hume-discovery-set");
  assert.ok(product, "An available product is required");
  const cart = [{ ...product, image: product.images[0] || "", quantity: 1 }];
  const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, ADMIN_CONTROLS_KEY));
  const quote = priceSecureCart(cart, null, 0, normalizeAdminControls(setting?.value));
  const fixtureSessionIds: string[] = [], fixtureOrderIds: string[] = [];
  const originalFetch = globalThis.fetch;
  let providerCreates = 0, providerAmount = 0, providerReceipt = "", wrongAmount = false, capturedAtProvider = false;
  globalThis.fetch = async (url, init) => {
    const path = String(url);
    assert.ok(path.startsWith("https://api.razorpay.com/v1/"), "Unexpected network request; no external requests are permitted during this verification");
    if (path.endsWith("/orders") && init?.method === "POST") {
      providerCreates++; providerAmount = JSON.parse(String(init.body)).amount; providerReceipt = JSON.parse(String(init.body)).receipt;
      return Response.json({ id: "order_local_fixture", amount: providerAmount, currency: "INR", status: "created" });
    }
    const payment = { id: "pay_local_fixture", order_id: "order_local_fixture", amount: wrongAmount ? 100 : providerAmount, currency: "INR", status: "captured" };
    if (path.includes("orders?receipt=")) return Response.json({ items: [{ id: "order_local_fixture", amount: providerAmount, currency: "INR", status: "created", receipt: providerReceipt }] });
    if (path.endsWith("/payments")) return Response.json({ items: capturedAtProvider ? [payment] : [] });
    if (path.includes("/payments/")) return Response.json(payment);
    return Response.json({ id: "order_local_fixture", amount: providerAmount, currency: "INR", status: "created" });
  };
  const request = (route: string, body?: unknown, cookie = "", token = "") => new NextRequest(`http://localhost:3002${route}`, { method: "POST", headers: { origin: "http://localhost:3002", "content-type": "application/json", cookie, ...(token ? { "x-hume-checkout-token": token } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  try {
    for (const partial of [false, true]) {
      capturedAtProvider = false;
      const start = await startSecureCheckout(request("/api/checkout-session", { cart })); assert.equal(start.status, 200);
      const token = (await start.json()).path.split("/").pop();
      const owner = start.cookies.get("hume_checkout_owner")!.value;
      const cookie = `hume_checkout_owner=${owner}; hume_checkout_active=${token}`;
      const { hashCustomerToken } = await import("../lib/customer-access-token");
      const [session] = await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.tokenHash, hashCustomerToken(token)!));
      fixtureSessionIds.push(session.id); fixtureOrderIds.push(session.orderId);
      const activeRequest = (cookieValue = cookie) => new NextRequest("http://localhost:3002/api/checkout-session/active", { headers: { cookie: cookieValue } });
      const [startedDraft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id));
      assert.equal(startedDraft.status, "started", "Opening token checkout creates the admin draft");
      assert.equal(Number(startedDraft.grandTotal), quote.grandTotal);
      assert.ok(!startedDraft.path?.includes(token), "Admin records must not store capability URLs");
      assert.equal((await recordCheckoutActivity(request("/api/checkout-session/activity", { event: "opened" }, "", token))).status, 401);
      assert.equal((await recordCheckoutActivity(request("/api/checkout-session/activity", { event: "opened", phone: "private" }, cookie, token))).status, 400);
      assert.equal((await recordCheckoutActivity(request("/api/checkout-session/activity", { event: "reason_given", reason: "full_cod" }, cookie, token))).status, 204);
      assert.equal((await recordCheckoutActivity(request("/api/checkout-session/activity", { events: [{ event: "place_order_clicked" }, { event: "payment_prepared" }] }, cookie, token))).status, 204, "Payment activity is saved in one batch");
      assert.equal((await recordCheckoutActivity(request("/api/checkout-session/activity", { events: [{ event: "opened", phone: "private" }] }, cookie, token))).status, 400, "Batched activity rejects personal data");
      assert.equal((await (await activeSecureCheckout(activeRequest())).json()).checkout.path, `/checkout/${token}`);
      assert.equal((await (await activeSecureCheckout(activeRequest(`hume_checkout_active=${token}`))).json()).checkout, null);
      assert.equal((await accountLookup(request("/api/account", { sessionId: session.id }))).status, 401, "Secure UUID alone cannot authorize account access");
      const details = { fullName: "Local Verification Fixture", phone: "9900000000", addressLine1: "Test fixture only", city: "Kanpur", state: "Uttar Pradesh", pincode: "208012" };
      const body = { cartSnapshot: cart, details, checkoutChannel: "razorpay", paymentMethod: partial ? "20% Prepaid + 80% Cash on Delivery" : "Razorpay Online Payment", status: "payment_pending", grandTotal: quote.grandTotal, shippingFee: quote.shippingFee };
      assert.equal((await saveSecureOrder(request("/api/orders", body, "", token))).status, 401);
      assert.equal((await saveSecureOrder(request("/api/orders", { ...body, grandTotal: 1 }, cookie, token))).status, 409);
      assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId))).length, 0);
      assert.equal((await saveSecureDraft(request("/api/checkout-drafts", { cartSnapshot: cart, details }, cookie, token))).status, 200);
      const [activityDraft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id));
      assert.equal((activityDraft.pricingBreakdown.checkoutActivity as Array<{ reason: string }>)[0].reason, "full_cod", "Autosave preserves activity and customer reasons");
      const [contactDraft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id));
      assert.equal(contactDraft.fullName, details.fullName);
      assert.equal(contactDraft.city, details.city);
      assert.equal(contactDraft.pricingBreakdown?.contactAlertQueued, true);
      assert.equal((await saveSecureDraft(request("/api/checkout-drafts", { cartSnapshot: cart, details: { ...details, phone: "" } }, cookie, token))).status, 200);
      assert.equal((await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id)))[0].pricingBreakdown?.contactAlertQueued, true, "Removing contact cannot reset alert deduplication");
      const prepared = await saveSecureOrder(request("/api/orders", body, cookie, token)); assert.equal(prepared.status, 200);
      assert.equal((await (await activeSecureCheckout(activeRequest())).json()).checkout.status, "payment_pending");
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId }))).status, 401);
      const resumed = await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId }, cookie));
      assert.equal(resumed.status, 200);
      assert.equal((await resumed.json()).path, `/checkout/${token}`, "Same browser resumes the same capability, session and order");
      const alternateMode = partial ? "full" : "partial_cod";
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: alternateMode }, cookie))).status, 200);
      assert.equal((await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.id, session.id)))[0].expectedPaymentMinor, expectedPaymentMinor(quote.grandTotal, !partial), "Changing an unstarted payment freezes the chosen amount");
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: partial ? "partial_cod" : "full" }, cookie))).status, 200);
      assert.equal((await accountLookup(request("/api/account", { sessionId: session.id }, cookie))).status, 200);
      assert.equal((await accountLookup(request("/api/account", {}, cookie))).status, 200, "Owner cookie restores account without local profile storage");
      assert.equal((await saveSecureOrder(request("/api/orders", { ...body, status: "processing" }, cookie, token))).status, 409);
      const countBefore = providerCreates;
      assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
      assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
      assert.equal(providerCreates, countBefore + 1, "Retries reuse the provider order");
      assert.equal(providerAmount, expectedPaymentMinor(quote.grandTotal, partial));
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: alternateMode }, cookie))).status, 409, "An existing provider payment cannot be silently changed");
      await db.update(orders).set({ razorpayOrderId: null, paymentSyncStatus: "creating" }).where(eq(orders.id, session.orderId));
      const restoredRequest = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token));
      assert.equal(restoredRequest.status, 200);
      assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].razorpayOrderId, "order_local_fixture", "An ambiguous provider creation is recovered by its server receipt");
      assert.equal(providerCreates, countBefore + 1);
      const callback = { razorpay_order_id: "order_local_fixture", razorpay_payment_id: "pay_local_fixture", razorpay_signature: createHmac("sha256", "test_local_only_secret").update("order_local_fixture|pay_local_fixture").digest("hex") };
      wrongAmount = true; assert.equal((await verifySecurePayment(request("/api/verify-payment", callback, cookie, token))).status, 409);
      assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].paymentCapturedAt, null);
      wrongAmount = false;
      if (!partial) {
        capturedAtProvider = true;
        const recovered = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token));
        assert.equal(recovered.status, 200); assert.equal((await recovered.json()).confirmed, true, "A missing callback is recovered from the provider");
      }
      if (partial) await db.update(orders).set({ status: "shipped", grandTotal: (quote.grandTotal + 100).toFixed(2) }).where(eq(orders.id, session.orderId));
      assert.equal((await verifySecurePayment(request("/api/verify-payment", callback, cookie, token))).status, 200);
      assert.equal((await verifySecurePayment(request("/api/verify-payment", callback, cookie, token))).status, 200);
      assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 409);
      const recovery = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token)); assert.equal(recovery.status, 200); assert.equal((await recovery.json()).confirmed, true);
      const saved = (await db.select().from(orders).where(eq(orders.id, session.orderId)))[0];
      assert.equal(saved.status, partial ? "shipped" : "processing");
      assert.equal(Number(saved.capturedPaymentAmount), providerAmount / 100);
      assert.equal((await (await activeSecureCheckout(activeRequest())).json()).checkout, null, "Paid orders lose the completion reminder");
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId }, cookie))).status, 409);
    }
    console.log("Secure checkout integration passed: admin drafts, contact alert deduplication, owner-only account recovery, same-order resume, closed reminders, tampered totals, full payment, advance COD, provider-order reuse, amount mismatch, repeat callbacks and fulfillment preservation. No real provider requests were made.");
  } finally {
    globalThis.fetch = originalFetch;
    if (fixtureOrderIds.length) { await db.delete(customerAccessLinks).where(inArray(customerAccessLinks.resourceId, fixtureOrderIds)); await db.delete(orders).where(inArray(orders.id, fixtureOrderIds)); }
    if (fixtureSessionIds.length) { await db.delete(checkoutDrafts).where(inArray(checkoutDrafts.sessionId, fixtureSessionIds)); await db.delete(secureCheckoutSessions).where(inArray(secureCheckoutSessions.id, fixtureSessionIds)); }
    console.log("Generated verification rows removed; existing customer orders were untouched.");
  }
}
main().then(() => process.exit(0)).catch(error => { console.error(error instanceof Error ? error.message : "Verification failed"); process.exit(1); });
