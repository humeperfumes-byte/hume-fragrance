// Run with: node --conditions=react-server --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-secure-checkout.ts
// Uses generated fixture IDs only; provider responses are mocked and fixture rows are removed.
import { config } from "dotenv";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
config({ path: ".env.local", quiet: true }); config({ path: ".env", quiet: true });
// This is a persistent local verification process, not a serverless deployment.
if (process.env.DATABASE_URL && process.env.CHECKOUT_VERIFY_TRANSACTION_POOL !== "true") {
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (databaseUrl.port === "6543" && databaseUrl.hostname.endsWith(".pooler.supabase.com")) { databaseUrl.port = "5432"; process.env.DATABASE_URL = databaseUrl.toString(); }
}
Object.assign(process.env, { ENABLE_SECURE_CHECKOUT: "true", ENABLE_ERROR_MONITORING: "false", RAZORPAY_KEY_ID: "test_local_only", RAZORPAY_KEY_SECRET: "test_local_only_secret", RAZORPAY_WEBHOOK_SECRET: "test_local_webhook_secret", NODE_ENV: "test" });
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
  const { orders, secureCheckoutSessions, customerAccessLinks, checkoutDrafts, siteSettings, razorpayWebhookEvents } = await import("../db/schema");
  const { POST: paymentWebhook } = await import("../app/api/razorpay/webhook/route");
  const { eq, inArray } = await import("drizzle-orm");
  const { startSecureCheckout, saveSecureDraft, saveSecureOrder, createSecurePayment, verifySecurePayment, recoverSecurePayment, activeSecureCheckout } = await import("../lib/secure-checkout");
  const { POST: accountLookup } = await import("../app/api/account/route");
  const { POST: resumeAccountCheckout } = await import("../app/api/account/checkout/resume/route");
  const { POST: recordCheckoutActivity } = await import("../app/api/checkout-session/activity/route");
  const { freshResumeCatalogue } = await import("../lib/fresh-resume-catalogue");
  const { normalizeAdminControls, ADMIN_CONTROLS_KEY } = await import("../lib/admin-settings");
  const { expectedPaymentMinor, priceSecureCart } = await import("../lib/secure-checkout-pricing");
  const product = (await freshResumeCatalogue()).find(p => p.priceCurrency === "INR" && !p.badges?.soldOut && !p.badges?.comingSoon && p.price >= 100 && p.price <= 1400 && p.id !== "hume-discovery-set");
  assert.ok(product, "An available product is required");
  const cart = [{ ...product, image: product.images[0] || "", quantity: 1 }];
  const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, ADMIN_CONTROLS_KEY));
  const quote = priceSecureCart(cart, null, 0, normalizeAdminControls(setting?.value));
  const fixtureSessionIds: string[] = [], fixtureOrderIds: string[] = [];
  const originalFetch = globalThis.fetch;
  let providerCreates = 0, providerReads = 0, providerAmount = 0, providerReceipt = "", wrongAmount = false, capturedAtProvider = false;
  let lookupEmpty = false, rejectCreate = false;
  let uniqueProviderIds = false, providerId = "order_local_fixture";
  const paymentOverrides = new Map<string, { id: string; order_id: string; amount: number; currency: string; status: string }[]>();
  globalThis.fetch = async (url, init) => {
    const path = String(url);
    assert.ok(path.startsWith("https://api.razorpay.com/v1/"), "Unexpected network request; no external requests are permitted during this verification");
    if (init?.method === 'GET') providerReads++;
    if (path.endsWith("/orders") && init?.method === "POST") {
      if (rejectCreate) return Response.json({ error: 'Synthetic rejection' }, { status: 400 });
      providerCreates++; providerAmount = JSON.parse(String(init.body)).amount; providerReceipt = JSON.parse(String(init.body)).receipt;
      providerId = uniqueProviderIds ? `order_switch_fixture_${providerCreates}` : "order_local_fixture";
      return Response.json({ id: providerId, amount: providerAmount, currency: "INR", status: "created" });
    }
    const payment = { id: "pay_local_fixture", order_id: "order_local_fixture", amount: wrongAmount ? 100 : providerAmount, currency: "INR", status: "captured" };
    if (path.includes("orders?receipt=")) return Response.json({ items: lookupEmpty ? [] : [{ id: "order_local_fixture", amount: providerAmount, currency: "INR", status: "created", receipt: providerReceipt }] });
    if (path.endsWith("/payments")) { const id = path.split("/").at(-2)!; return Response.json({ items: paymentOverrides.get(id) || (capturedAtProvider ? [payment] : []) }); }
    if (path.includes("/payments/")) return Response.json(payment);
    return Response.json({ id: path.split("/").at(-1), amount: providerAmount, currency: "INR", status: "created" });
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
      const body = { cartSnapshot: cart, details, checkoutChannel: "razorpay", paymentMethod: partial ? "20% Prepaid + 80% Cash on Delivery" : "Razorpay Online Payment", status: "payment_pending", grandTotal: quote.grandTotal + (partial ? 50 : 0), shippingFee: quote.shippingFee };
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
      assert.equal((await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.id, session.id)))[0].expectedPaymentMinor, expectedPaymentMinor(quote.grandTotal + (!partial ? 50 : 0), !partial), "Changing an unstarted payment freezes the chosen amount");
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: partial ? "partial_cod" : "full" }, cookie))).status, 200);
      const [feeOrder] = await db.select().from(orders).where(eq(orders.id, session.orderId));
      assert.equal(Number(feeOrder.codFee), partial ? 50 : 0, "COD fee is stored independently");
      assert.equal(Number(feeOrder.grandTotal), quote.grandTotal + (partial ? 50 : 0), "Returning to the original mode restores the total without duplicate fees");
      assert.equal((await accountLookup(request("/api/account", { sessionId: session.id }, cookie))).status, 200);
      assert.equal((await accountLookup(request("/api/account", {}, cookie))).status, 200, "Owner cookie restores account without local profile storage");
      assert.equal((await saveSecureOrder(request("/api/orders", { ...body, status: "processing" }, cookie, token))).status, 409);
      const countBefore = providerCreates;
      assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
      const readsBeforeRetry = providerReads;
      assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
      assert.equal(providerReads, readsBeforeRetry, 'Normal retries do not wait on provider history or status fetches');
      assert.equal(providerCreates, countBefore + 1, "Retries reuse the provider order");
      assert.equal(providerAmount, expectedPaymentMinor(quote.grandTotal + (partial ? 50 : 0), partial));
      capturedAtProvider = true;
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: alternateMode }, cookie))).status, 409, "An existing paid provider payment cannot be changed");
      capturedAtProvider = false;
      const unpaid = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token));
      assert.equal((await unpaid.json()).state, "unpaid", "A closed unpaid window is not an uncertain payment");
      await db.update(orders).set({ razorpayOrderId: null, paymentSyncStatus: "creating" }).where(eq(orders.id, session.orderId));
      const restoredRequest = await createSecurePayment(request("/api/create-order", {}, cookie, token));
      assert.equal(restoredRequest.status, 200);
      assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].razorpayOrderId, "order_local_fixture", "An ambiguous provider creation is recovered by its server receipt");
      assert.equal(providerCreates, countBefore + 1);
      await db.update(orders).set({ paymentSyncStatus: 'payment_review', paymentReconciledAt: new Date() }).where(eq(orders.id, session.orderId));
      const legacyRetry = await createSecurePayment(request('/api/create-order', {}, cookie, token));
      assert.equal(legacyRetry.status, 200, 'An old review with no received payment repairs itself on the payment click');
      assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].paymentSyncStatus, 'pending');
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
      const alreadyPaid = await createSecurePayment(request("/api/create-order", {}, cookie, token));
      assert.equal(alreadyPaid.status, 200);
      assert.equal((await alreadyPaid.json()).confirmed, true, 'A known paid order redirects to confirmation instead of a payment-review loop');
      const recovery = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token)); assert.equal(recovery.status, 200); assert.equal((await recovery.json()).confirmed, true);
      const saved = (await db.select().from(orders).where(eq(orders.id, session.orderId)))[0];
      assert.equal(saved.status, partial ? "shipped" : "processing");
      assert.equal(Number(saved.capturedPaymentAmount), providerAmount / 100);
      assert.equal((await (await activeSecureCheckout(activeRequest())).json()).checkout, null, "Paid orders lose the completion reminder");
      assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId }, cookie))).status, 409);
    }
    uniqueProviderIds = true; capturedAtProvider = false;
    const start = await startSecureCheckout(request("/api/checkout-session", { cart }));
    assert.equal(start.status, 200);
    const token = (await start.json()).path.split("/").pop();
    const cookie = `hume_checkout_owner=${start.cookies.get("hume_checkout_owner")!.value}; hume_checkout_active=${token}`;
    const { hashCustomerToken } = await import("../lib/customer-access-token");
    const [session] = await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.tokenHash, hashCustomerToken(token)!));
    fixtureSessionIds.push(session.id); fixtureOrderIds.push(session.orderId);
    const details = { fullName: "Local Verification Fixture", phone: "9900000000", addressLine1: "Test fixture only", city: "Kanpur", state: "Uttar Pradesh", pincode: "208012" };
    assert.equal((await saveSecureOrder(request("/api/orders", { cartSnapshot: cart, details, checkoutChannel: "razorpay", paymentMethod: "Razorpay Online Payment", status: "payment_pending", grandTotal: quote.grandTotal, shippingFee: quote.shippingFee }, cookie, token))).status, 200);
    assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
    const previousId = providerId;
    paymentOverrides.set(previousId, [{ id: "pay_processing_fixture", order_id: previousId, amount: providerAmount, currency: "INR", status: "authorized" }]);
    const processing = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token));
    assert.equal((await processing.json()).canPay, false, "Authorized payments block another attempt");
    assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: "partial_cod" }, cookie))).status, 409, "COD cannot replace an authorized payment");
    paymentOverrides.set(previousId, []);
    assert.equal((await resumeAccountCheckout(request("/api/account/checkout/resume", { orderId: session.orderId, paymentMode: "partial_cod" }, cookie))).status, 200, "An unpaid full-payment request can switch safely to advance COD");
    const [changed] = await db.select().from(orders).where(eq(orders.id, session.orderId));
    assert.equal(changed.razorpayOrderId, null);
    assert.equal(changed.id, session.orderId, "COD switch retains customer order identity");
    const [draft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id));
    assert.deepEqual(draft.pricingBreakdown.previousPaymentRequests, [previousId], "Earlier provider request is retained for late-payment checks");
    const previousWebhook = async (status: "failed" | "captured") => {
      const payload = JSON.stringify({ event: `payment.${status}`, payload: { payment: { entity: { id: `pay_stale_${status}`, order_id: previousId, amount: expectedPaymentMinor(quote.grandTotal, false), currency: "INR", status } } } });
      return paymentWebhook(new NextRequest("http://localhost:3002/api/razorpay/webhook", { method: "POST", headers: { "x-razorpay-signature": createHmac("sha256", "test_local_webhook_secret").update(payload).digest("hex"), "x-razorpay-event-id": `fixture-${session.id}-${status}`, "content-type": "application/json" }, body: payload }));
    };
    const oldFailure = await previousWebhook("failed");
    assert.equal(oldFailure.status, 200);
    assert.equal((await oldFailure.json()).ignoredPreviousPayment, true, "An old failed webhook is recognized even without provider notes");
    assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].razorpayOrderId, null, "Old webhooks cannot restore the full-payment request during a COD switch");
    assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
    assert.notEqual(providerId, previousId);
    assert.equal(providerAmount, expectedPaymentMinor(quote.grandTotal + 50, true), "COD collects only the frozen advance");
    const createsBeforeRetry = providerCreates;
    assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200);
    assert.equal(providerCreates, createsBeforeRetry, "COD retry reuses the same provider request");
    await db.update(orders).set({ paymentSyncStatus: "switching", updatedAt: new Date(Date.now() - 120000) }).where(eq(orders.id, session.orderId));
    const interruptedSwitch = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token));
    assert.equal(interruptedSwitch.status, 200);
    assert.equal((await interruptedSwitch.json()).canPay, true, "An interrupted mode-change claim can be checked and recovered");
    assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].razorpayOrderId, providerId, "Recovering a stale claim never changes the provider request");
    paymentOverrides.set(previousId, [{ id: "pay_transient_fixture", order_id: previousId, amount: expectedPaymentMinor(quote.grandTotal, false), currency: "INR", status: "created" }]);
    assert.equal((await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token))).status, 409, "An active earlier attempt blocks repayment");
    assert.notEqual((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].paymentSyncStatus, "payment_review", "A transient attempt does not permanently mark the order for review");
    paymentOverrides.set(previousId, [{ id: "pay_transient_fixture", order_id: previousId, amount: expectedPaymentMinor(quote.grandTotal, false), currency: "INR", status: "failed" }]);
    await db.update(orders).set({ paymentSyncStatus: "payment_review", paymentReconciledAt: new Date() }).where(eq(orders.id, session.orderId));
    const resolvedReview = await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token));
    assert.equal(resolvedReview.status, 200);
    assert.equal((await resolvedReview.json()).canPay, true, "A legacy review clears after all prior and current attempts are verified unpaid");
    assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 200, "The customer can resume the existing COD payment after a failed earlier attempt");
    assert.equal(providerCreates, createsBeforeRetry, "Resolving a stale review creates no duplicate provider request");
    paymentOverrides.set(previousId, [{ id: "pay_late_fixture", order_id: previousId, amount: expectedPaymentMinor(quote.grandTotal, false), currency: "INR", status: "captured" }]);
    assert.equal((await recoverSecurePayment(request("/api/checkout-session/recover", undefined, cookie, token))).status, 409, "A late earlier payment is held for review");
    assert.equal((await createSecurePayment(request("/api/create-order", {}, cookie, token))).status, 409, "A late earlier payment blocks another payment");
    assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].paymentSyncStatus, "payment_review");
    const lateCapture = await previousWebhook("captured");
    assert.equal(lateCapture.status, 200);
    assert.equal((await lateCapture.json()).reviewRequired, true, "A late previous capture is held for review by the webhook too");
    assert.equal((await db.select().from(orders).where(eq(orders.id, session.orderId)))[0].status, "payment_pending", "A stale full-payment webhook cannot fulfill an advance-COD order");
    capturedAtProvider = false;
    const combinedStart = await startSecureCheckout(request('/api/checkout-session', { cart }));
    assert.equal(combinedStart.status, 200);
    const combinedToken = (await combinedStart.json()).path.split('/').pop();
    const combinedCookie = `hume_checkout_owner=${combinedStart.cookies.get('hume_checkout_owner')!.value}; hume_checkout_active=${combinedToken}`;
    const [combinedSession] = await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.tokenHash, hashCustomerToken(combinedToken)!));
    fixtureSessionIds.push(combinedSession.id); fixtureOrderIds.push(combinedSession.orderId);
    await db.update(secureCheckoutSessions).set({ cart: [{ ...cart[0], id: 'removed-from-bag-fixture' }] }).where(eq(secureCheckoutSessions.id, combinedSession.id));
    const checkout = { cartSnapshot: cart, details, checkoutChannel: 'razorpay', paymentMethod: 'Razorpay Online Payment', status: 'payment_pending', grandTotal: quote.grandTotal, shippingFee: quote.shippingFee };
    assert.equal((await createSecurePayment(request('/api/create-order', { checkout: { ...checkout, grandTotal: 1 } }, combinedCookie, combinedToken))).status, 409, 'Combined startup still rejects tampered prices');
    const combined = await createSecurePayment(request('/api/create-order', { checkout }, combinedCookie, combinedToken));
    assert.equal(combined.status, 200, await combined.clone().text());
    assert.ok((await combined.json()).order_id, 'One request saves checkout and prepares Razorpay using the updated cart, not its old session snapshot');
    const [combinedOrder] = await db.select().from(orders).where(eq(orders.id, combinedSession.orderId));
    assert.equal(combinedOrder.fullName, details.fullName);
    lookupEmpty = true;
    await db.update(orders).set({ razorpayOrderId: null, paymentSyncStatus: 'creating', updatedAt: new Date(Date.now() - 120000) }).where(eq(orders.id, combinedOrder.id));
    const missing = await createSecurePayment(request('/api/create-order', {}, combinedCookie, combinedToken));
    assert.equal(missing.status, 200, await missing.clone().text());
    assert.ok((await missing.json()).order_id, 'A stale creation with no provider record is recovered automatically');
    await db.update(orders).set({ razorpayOrderId: null, paymentSyncStatus: 'unpaid' }).where(eq(orders.id, combinedOrder.id));
    rejectCreate = true;
    const rejected = await createSecurePayment(request('/api/create-order', {}, combinedCookie, combinedToken));
    assert.equal(rejected.status, 400);
    assert.equal((await db.select().from(orders).where(eq(orders.id, combinedOrder.id)))[0].paymentSyncStatus, 'unpaid', 'Definitive rejection must not leave a creating lock');
    rejectCreate = false;
    assert.equal((await createSecurePayment(request('/api/create-order', {}, combinedCookie, combinedToken))).status, 200);
    // Boundary prices are server-owned overrides on generated drafts only.
    for (const base of [1500, 1500.01]) {
      const fresh = await startSecureCheckout(request('/api/checkout-session', { cart }));
      assert.equal(fresh.status, 200);
      const freshToken = (await fresh.json()).path.split('/').pop();
      const freshCookie = 'hume_checkout_owner=' + fresh.cookies.get('hume_checkout_owner')!.value + '; hume_checkout_active=' + freshToken;
      const [freshSession] = await db.select().from(secureCheckoutSessions).where(eq(secureCheckoutSessions.tokenHash, hashCustomerToken(freshToken)!));
      fixtureSessionIds.push(freshSession.id); fixtureOrderIds.push(freshSession.orderId);
      const [freshDraft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, freshSession.id));
      await db.update(checkoutDrafts).set({pricingBreakdown:{...freshDraft.pricingBreakdown,overrideTotal:base}}).where(eq(checkoutDrafts.id,freshDraft.id));
      const boundaryOrder = {cartSnapshot:cart,details,checkoutChannel:'razorpay',paymentMethod:'20% Prepaid + 80% Cash on Delivery',status:'payment_pending',grandTotal:base + 50,shippingFee:quote.shippingFee};
      const boundaryResult = await saveSecureOrder(request('/api/orders',boundaryOrder,freshCookie,freshToken));
      assert.equal(boundaryResult.status, base === 1500 ? 200 : 409, 'Server enforces COD boundary before the fee');
      if (base === 1500) {
        let [boundarySaved] = await db.select().from(orders).where(eq(orders.id,freshSession.orderId));
        assert.equal(Number(boundarySaved.codFee),50); assert.equal(Number(boundarySaved.grandTotal),1550);
        for (const nextMode of ['full','partial_cod','full'] as const) {
          assert.equal((await createSecurePayment(request('/api/create-order',{},freshCookie,freshToken))).status,200);
          const switched = await resumeAccountCheckout(request('/api/account/checkout/resume',{orderId:freshSession.orderId,paymentMode:nextMode},freshCookie));
          assert.equal(switched.status,200,'Unpaid provider requests can switch in both directions');
          [boundarySaved] = await db.select().from(orders).where(eq(orders.id,freshSession.orderId));
          assert.equal(Number(boundarySaved.codFee),nextMode === 'full' ? 0 : 50);
          assert.equal(Number(boundarySaved.grandTotal),nextMode === 'full' ? 1500 : 1550);
        }
      }
    }
    console.log("Secure checkout integration passed: single-request payment launch, zero provider reads on normal retry, interrupted-creation recovery, rejection recovery, paid-order confirmation, admin drafts, owner-only recovery, full payment, advance COD switching, late-payment protection, amount validation and callback idempotency. No real provider requests were made.");
  } finally {
    globalThis.fetch = originalFetch;
    if (fixtureOrderIds.length) { await db.delete(razorpayWebhookEvents).where(inArray(razorpayWebhookEvents.localOrderId, fixtureOrderIds)); await db.delete(customerAccessLinks).where(inArray(customerAccessLinks.resourceId, fixtureOrderIds)); await db.delete(orders).where(inArray(orders.id, fixtureOrderIds)); }
    if (fixtureSessionIds.length) { await db.delete(checkoutDrafts).where(inArray(checkoutDrafts.sessionId, fixtureSessionIds)); await db.delete(secureCheckoutSessions).where(inArray(secureCheckoutSessions.id, fixtureSessionIds)); }
    console.log("Generated verification rows removed; existing customer orders were untouched.");
  }
}
main().then(() => process.exit(0)).catch(error => {
  console.error(error instanceof Error ? error.message : "Verification failed");
  const cause = error?.cause;
  if (cause) console.error("Database failure type:", cause.name, "code:", cause.code || "unavailable");
  process.exit(1);
});
