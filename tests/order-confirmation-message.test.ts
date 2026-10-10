import test from "node:test";
import assert from "node:assert/strict";
import type { Order } from "../db/schema";
import { buildOrderSuccessMessage } from "../lib/order-confirmation-message";

const order = { fullName: "Test Customer", orderNumber: "HME-123", status: "processing", grandTotal: "999", phone: "+91 9876543210", addressLine1: "12 Test Street", addressLine2: "Near Park", city: "Mumbai", state: "Maharashtra", pincode: "400001", cartSnapshot: Array.from({ length: 5 }, (_, index) => ({ id: String(index), name: `Perfume ${index}`, size: "50ml", quantity: 1, price: 199 })) } as Order;
test("confirmation preserves paragraphs and includes every item and delivery details", () => {
  const message = buildOrderSuccessMessage(order);
  assert.ok(message.includes("Hi Test Customer,\n\n*Your HUME order is confirmed!*"));
  assert.ok(message.includes("Perfume 4"));
  assert.ok(message.includes("12 Test Street\nNear Park\nMumbai, Maharashtra, 400001\nMobile: 9876543210"));
  assert.ok(message.includes("Reply here if anything needs correcting."));
  assert.ok(!message.includes("Online payment received"));
});
test("pending orders do not claim confirmation and discovery selections and gifts are included", () => {
  const message = buildOrderSuccessMessage({ ...order, status: "payment_pending", cartSnapshot: [{ id: "set", name: "Discovery Set", quantity: 1, price: 999, sampleSelections: [{ id: "a", name: "Aventus" }, { id: "b", name: "Sauvage" }] }, { id: "gift", name: "Sample", quantity: 1, price: 0, isGift: true }] });
  assert.ok(!message.includes("order is confirmed"));
  assert.ok(message.includes("Fragrances: Aventus, Sauvage"));
  assert.ok(message.includes("Sample × 1 — complimentary"));
});
