import assert from "node:assert/strict";
import test from "node:test";
import { isCodEligible, totalWithCod, savedCodFee, COD_PAYMENT_METHOD } from "../lib/cod-policy";
import { expectedPaymentMinor } from "../lib/secure-checkout-pricing";
test("COD limit includes exactly 1500 and rejects higher or invalid totals", () => {
  assert.equal(isCodEligible(1500), true);
  for (const total of [1500.01, 1600, 0, -1, NaN, Infinity]) assert.equal(isCodEligible(total), false);
  assert.throws(() => totalWithCod(1500.01), /1,500/);
});
test("COD adds 50 once and advance uses the fee-inclusive total", () => {
  assert.equal(totalWithCod(1000), 1050);
  assert.equal(totalWithCod(1500), 1550);
  assert.equal(expectedPaymentMinor(totalWithCod(1000), true), 21000);
  const saved = totalWithCod(1000);
  assert.equal(totalWithCod(saved - savedCodFee(COD_PAYMENT_METHOD, 50)), saved);
  assert.equal(savedCodFee("Razorpay Online Payment"), 0);
  assert.equal(savedCodFee("20% Prepaid + 80% Cash on Delivery"), 0);
});

test("structured fee takes precedence over payment labels", () => {
  assert.equal(savedCodFee("Changed display label", "50.00"), 50);
  assert.equal(savedCodFee("includes ₹50 COD fee", "0.00"), 0);
  assert.equal(savedCodFee(COD_PAYMENT_METHOD, NaN), 0);
});
