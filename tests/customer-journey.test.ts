import test from "node:test";
import assert from "node:assert/strict";
import type { Order } from "../db/schema";
import { createCustomerToken, hashCustomerToken, isUsableCustomerLink } from "../lib/customer-access-token";
import { customerOrderView } from "../lib/customer-order-view";
import { isPrivateCustomerPath } from "../lib/private-customer-path";
import { buildResumeCart, type ResumeProduct } from "../lib/checkout-resume-cart";
test("access capabilities are unpredictable, hashed, scoped, expiring and revocable", () => {
  const first = createCustomerToken();
  assert.equal(first.token.length, 43);
  assert.equal(first.hash, hashCustomerToken(first.token));
  assert.notEqual(first.token, createCustomerToken().token);
  assert.notEqual(first.token, first.hash);
  assert.equal(hashCustomerToken("HF-123"), null);
  const link = { scope: "order", expiresAt: new Date(Date.now() + 10000), revokedAt: null };
  assert.equal(isUsableCustomerLink(link, "order"), true);
  assert.equal(isUsableCustomerLink(link, "checkout"), false);
  assert.equal(isUsableCustomerLink({ ...link, revokedAt: new Date() }, "order"), false);
  assert.equal(isUsableCustomerLink({ ...link, expiresAt: new Date(0) }, "order"), false);
});
test("order view never serializes private customer fields or infers paid from processing", () => {
  const order = { fullName: "Private Customer", phone: "9876543210", email: "private@example.com", addressLine1: "Private address", notes: "Private notes", whatsappMessage: "Private message", orderNumber: "HF-123", status: "processing", grandTotal: "799", cartSnapshot: [], capturedPaymentAmount: "0", paymentCapturedAt: null } as unknown as Order;
  const view = customerOrderView(order);
  const output = JSON.stringify(view);
  for (const secret of [order.fullName, order.phone, order.email, order.addressLine1, order.notes, order.whatsappMessage]) assert.ok(!output.includes(secret!));
  assert.equal(view.payment, "Awaiting payment verification");
  assert.equal(customerOrderView({ ...order, capturedPaymentAmount: "799", paymentCapturedAt: new Date() }).payment, "Payment received");
  assert.equal(customerOrderView({ ...order, capturedPaymentAmount: "800", paymentCapturedAt: new Date() }).payment, "Awaiting payment verification");
  assert.equal(customerOrderView({ ...order, status: "refunded", capturedPaymentAmount: "799", paymentCapturedAt: new Date() }).payment, "Contact HUME for payment details");
});
test("resume uses current catalogue prices and blocks invalid products without exposing customer information", () => {
  const product: ResumeProduct = { id: "p", name: "Perfume", inspiration: "Fragrance", price: 899, size: "50ml", category: "Men", images: [], badges: {} };
  const result = buildResumeCart([{ id: "p", quantity: 2, price: 799 }, { id: "gift", quantity: 1, price: 0, isGift: true }], [product]);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].price, 899);
  assert.equal(result.items[0].quantity, 2);
  assert.equal(result.pricesChanged, true);
  assert.equal(buildResumeCart([{ id: "p", quantity: 1, price: 799 }], [{ ...product, badges: { soldOut: true } }]).items.length, 0);
  assert.equal(buildResumeCart([{ id: "p", quantity: 0, price: 799 }], [product]).issues.length, 1);
});
test("secret customer routes are recognized while normal checkout stays public", () => {
  assert.equal(isPrivateCustomerPath("/order/abc"), true);
  assert.equal(isPrivateCustomerPath("/checkout/abc"), true);
  assert.equal(isPrivateCustomerPath("/us/order/abc"), true);
  assert.equal(isPrivateCustomerPath("/checkout"), false);
  assert.equal(isPrivateCustomerPath("/order-success"), false);
});
