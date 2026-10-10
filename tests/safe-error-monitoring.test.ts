import test from "node:test";
import assert from "node:assert/strict";
import { deliverSafeError, makeSafeErrorEvent } from "../lib/safe-error-monitoring";
import { shouldBlockAnotherPayment, type PaymentRecovery } from "../lib/payment-recovery";
test("diagnostics only contain allowlisted non-customer data", () => {
  const event = makeSafeErrorEvent("ORDER_SAVE_FAILED");
  assert.deepEqual(Object.keys(event).sort(), ["code", "occurredAt", "reference"]);
  assert.match(event.reference, /^[a-f0-9-]{36}$/);
});
test("disabled and failing monitoring do not affect the operation", async () => {
  let calls = 0;
  await deliverSafeError("PAID_ORDER_SAVE_FAILED", false, () => { calls++; });
  assert.equal(calls, 0);
  await assert.doesNotReject(deliverSafeError("PAID_ORDER_SAVE_FAILED", true, () => { throw new Error("sink unavailable"); }));
});
test("verified payment awaiting order save blocks another payment", () => {
  const base = { orderId: "id", orderNumber: "HF-123", grandTotal: 799, createdAt: new Date().toISOString() };
  assert.equal(shouldBlockAnotherPayment({ ...base, status: "verified_pending_save" }), true);
  for (const status of ["payment_pending", "payment_failed"] as PaymentRecovery["status"][]) assert.equal(shouldBlockAnotherPayment({ ...base, status }), false);
  assert.equal(shouldBlockAnotherPayment(null), false);
});
