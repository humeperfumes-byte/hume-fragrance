import assert from "node:assert/strict";
import test from "node:test";
import { manualPaymentAmounts, readManualPayment, writeManualPayment, validateManualLink, manualOrderSchema, manualPaymentNextStatus, isManualPaymentEvent } from "../lib/manual-order";

test("20% advance and remaining COD preserve paise and the complete order total", () => {
  const amounts = manualPaymentAmounts(99999, "partial_cod");
  assert.equal(amounts.advanceMinor, 20000);
  assert.equal(amounts.codMinor, 79999);
  assert.equal(amounts.advanceMinor + amounts.codMinor, amounts.totalMinor);
  assert.equal(manualPaymentAmounts(99999, "full").advanceMinor, 99999);
  assert.throws(() => manualPaymentAmounts(101, "partial_cod"));
  assert.throws(() => manualPaymentAmounts(NaN, "full"));
});
test("payment verification rejects the full amount on an advance link, wrong references and unpaid links", () => {
  const payment = manualPaymentAmounts(100000, "partial_cod");
  const link = { reference_id: "order", currency: "INR", amount: 20000, amount_paid: 20000, status: "paid" };
  assert.equal(validateManualLink(payment, link, "order"), true);
  assert.equal(validateManualLink(payment, { ...link, status: "created", amount_paid: 0 }, "order"), false);
  assert.throws(() => validateManualLink(payment, { ...link, amount: 100000 }, "order"));
  assert.throws(() => validateManualLink(payment, { ...link, amount_paid: 10000 }, "order"));
  assert.throws(() => validateManualLink(payment, { ...link, currency: "USD" }, "order"));
  assert.throws(() => validateManualLink(payment, link, "another-order"));
});
test("metadata updates retain the audit trail and reject corrupted amounts or unsafe links", () => {
  const payment = manualPaymentAmounts(100000, "partial_cod");
  const message = writeManualPayment("Existing audit", payment);
  const updated = writeManualPayment(message, { ...payment, linkId: "plink_test", url: "https://rzp.io/test" });
  assert.equal(updated.split("HUME manual payment:").length, 2);
  assert.ok(updated.includes("Existing audit"));
  assert.equal(readManualPayment(updated)?.codMinor, 80000);
  assert.equal(readManualPayment(writeManualPayment(null, { ...payment, advanceMinor: 100 })), null);
  assert.equal(readManualPayment(writeManualPayment(null, { ...payment, url: "javascript:alert(1)" })), null);
});
test("admin inputs reject negative quantities, invalid addresses and supplied client prices", () => {
  const input = { requestId: "8f60fb40-bd37-4b77-beda-7a88f8ca3a03", fullName: "Customer", phone: "9876543210", addressLine1: "123 Main Road", city: "Mumbai", state: "Maharashtra", pincode: "400001", items: [{ id: "perfume", quantity: 1 }], paymentMode: "partial_cod" };
  assert.equal(manualOrderSchema.safeParse(input).success, true);
  assert.equal(manualOrderSchema.safeParse({ ...input, price: 1 }).success, false);
  assert.equal(manualOrderSchema.safeParse({ ...input, pincode: "123" }).success, false);
  assert.equal(manualOrderSchema.safeParse({ ...input, items: [{ id: "perfume", quantity: -1 }] }).success, false);
});
test("duplicate payment checks preserve fulfillment, cancellation and refund statuses", () => {
  assert.equal(manualPaymentNextStatus("payment_pending", true), "processing");
  assert.equal(manualPaymentNextStatus("payment_pending", false), "payment_pending");
  for (const status of ["processing", "packed", "shipped", "delivered", "cancelled", "refunded", "payment_disputed"]) assert.equal(manualPaymentNextStatus(status, true), status);
});
test("refunds and disputes continue through their existing webhook handlers", () => {
  assert.equal(isManualPaymentEvent("payment_link.paid"), true);
  assert.equal(isManualPaymentEvent("payment.captured"), true);
  assert.equal(isManualPaymentEvent("payment.dispute.created"), false);
  assert.equal(isManualPaymentEvent("refund.processed"), false);
});
