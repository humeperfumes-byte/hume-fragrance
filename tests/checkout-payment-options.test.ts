import assert from "node:assert/strict";
import test from "node:test";
import { canChooseCheckoutPayment } from "../lib/checkout-payment-options";

test("first checkout and ordinary refresh do not offer partial COD", () => {
  assert.equal(canChooseCheckoutPayment({ paymentPending: false }), false);
  assert.equal(canChooseCheckoutPayment({ paymentPending: false, resumed: false }), false);
});
test("complete-checkout draft links and pending account orders offer payment choices", () => {
  assert.equal(canChooseCheckoutPayment({ paymentPending: false, resumed: true }), true);
  assert.equal(canChooseCheckoutPayment({ paymentPending: true }), true);
});
