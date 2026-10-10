import test from "node:test";
import assert from "node:assert/strict";
import { createCustomerToken } from "../lib/customer-access-token";
import { deriveOrderToken, ownsCheckout } from "../lib/secure-checkout-capability";
import { priceSecureCart, expectedPaymentMinor, storedPaymentMinor, matchesCapturedPayment } from "../lib/secure-checkout-pricing";
import { defaultAdminControls } from "../lib/admin-settings";
import { advanceVisitReward, readVisitReward, signVisitReward } from "../lib/server-visit-reward";
import { readBoundedJson } from "../lib/bounded-request-body";
test("checkout ownership requires a separate secret and order capability is scoped", () => {
  const owner = createCustomerToken(), checkout = createCustomerToken();
  assert.equal(ownsCheckout(owner.token, owner.hash), true);
  assert.equal(ownsCheckout(checkout.token, owner.hash), false);
  assert.equal(ownsCheckout(undefined, owner.hash), false);
  assert.notEqual(deriveOrderToken(checkout.token), checkout.token);
  assert.equal(deriveOrderToken(checkout.token).length, 43);
});
test("server quote enforces coupon, reward caps and shipping in paise", () => {
  const items = [{ id: "p", name: "P", price: 799, quantity: 2, image: "", inspiration: "", category: "Perfume", size: "50ml" }];
  const coupon = { code: "TEN", description: "10%", type: "percent", value: 10, minSubtotal: 0, welcomeBackMode: "cap_5" };
  const quote = priceSecureCart(items, coupon, 10, defaultAdminControls);
  assert.equal(quote.subtotal, 1598); assert.equal(quote.shippingFee, 0); assert.equal(quote.grandTotal, 1358.3);
  assert.equal(expectedPaymentMinor(799, true), 16000);
  assert.equal(expectedPaymentMinor(799.49, false), 79949);
  assert.equal(storedPaymentMinor(79900, 999, false), 79900);
  assert.equal(storedPaymentMinor(null, 799, true), 16000);
  assert.equal(priceSecureCart([{ ...items[0], price: 199, quantity: 1 }], null, 0, defaultAdminControls).grandTotal, 299);
});
test("provider confirmation rejects wrong order, amount, currency and authorization-only payments", () => {
  const payment = { order_id: "order_a", amount: 79900, currency: "INR", status: "captured" };
  assert.equal(matchesCapturedPayment(payment, "order_a", 79900), true);
  for (const change of [{ order_id: "order_b" }, { amount: 100 }, { currency: "USD" }, { status: "authorized" }]) assert.equal(matchesCapturedPayment({ ...payment, ...change }, "order_a", 79900), false);
});
test("server visit rewards reject forged and expired cookies and repeated refreshes do not unlock offers", () => {
  const now = Date.now(), secret = "test-only-secret";
  const first = advanceVisitReward(null, now);
  assert.equal(advanceVisitReward(first, now + 1000).tier, 0);
  const second = advanceVisitReward(first, now + 600001);
  assert.equal(second.tier, 5);
  const cookie = signVisitReward(second, secret);
  assert.equal(readVisitReward(cookie, secret, now + 600001)?.tier, 5);
  assert.equal(readVisitReward(cookie, "another-secret", now + 600001), null);
  assert.equal(readVisitReward(cookie, secret, second.expiresAt + 1), null);
});
test("public JSON requests reject oversized and malformed bodies", async () => {
  assert.deepEqual(await readBoundedJson(new Request("http://localhost", { method: "POST", body: '{"ok":true}' }), 30), { ok: true });
  await assert.rejects(readBoundedJson(new Request("http://localhost", { method: "POST", body: "x".repeat(50) }), 20));
  await assert.rejects(readBoundedJson(new Request("http://localhost", { method: "POST", body: "{" }), 20));
});
