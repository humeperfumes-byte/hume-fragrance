import assert from "node:assert/strict";
import test from "node:test";
import { checkoutCanContinue, checkoutDraftAlert, hasCheckoutContact } from "../lib/checkout-continuation";

test("Only unpaid online orders and drafts can continue", () => {
  assert.equal(checkoutCanContinue(null), true);
  const pending = { status: "payment_pending", checkoutChannel: "razorpay", paymentCapturedAt: null };
  assert.equal(checkoutCanContinue(pending), true);
  assert.equal(checkoutCanContinue({ ...pending, status: "payment_failed" }), true);
  assert.equal(checkoutCanContinue({ ...pending, paymentCapturedAt: new Date() }), false);
  assert.equal(checkoutCanContinue({ ...pending, checkoutChannel: "whatsapp" }), false);
  for (const status of ["cancelled", "refunded", "partially_refunded", "disputed", "delivered", "complete"]) assert.equal(checkoutCanContinue({ ...pending, status }), false);
});

test("Draft alerts wait for valid contact details and do not repeat on ordinary edits", () => {
  const empty = { phone: "", email: "" };
  assert.equal(checkoutDraftAlert(null, empty), "initiated");
  assert.equal(checkoutDraftAlert(empty, { phone: "9900", email: "" }), null);
  for (const phone of ["9900000000", "+91 99000 00000", "09900000000"]) assert.equal(hasCheckoutContact({ phone, email: "" }), true);
  assert.equal(checkoutDraftAlert(empty, { phone: "9900000000", email: "" }), "contact_added");
  assert.equal(checkoutDraftAlert({ phone: "9900000000", email: "" }, { phone: "9900000001", email: "" }), null);
  assert.equal(checkoutDraftAlert(empty, { phone: "", email: "fixture@example.invalid" }), "contact_added");
});
