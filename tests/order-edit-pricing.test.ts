import assert from "node:assert/strict";
import { test } from "node:test";
import { getStoredOrderDiscount, preserveOrderItem } from "../lib/order-edit-pricing";

test("quantity changes preserve historical prices and product details", () => {
  const original = { id: "perfume", name: "Original name", price: 799, quantity: 1 };
  assert.deepEqual(preserveOrderItem({ ...original, name: "New name", price: 999, quantity: 2 }, [original]), { ...original, quantity: 2 });
  assert.equal(original.quantity, 1);
  assert.equal(preserveOrderItem({ ...original, id: "new-product" }, [original]), undefined);
});

test("shipping edits preserve discounts without treating manual discounts as coupons", () => {
  assert.equal(getStoredOrderDiscount({ subtotal: "1000", shippingFee: "50", manualAdjustment: "-100", grandTotal: "750" }), 200);
  assert.equal(getStoredOrderDiscount({ subtotal: "1000", shippingFee: "0", manualAdjustment: "-100", grandTotal: "900" }), 0);
});
