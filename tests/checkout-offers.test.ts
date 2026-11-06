import assert from "node:assert/strict";
import test from "node:test";
import { savedCheckoutDiscount, savedCouponCode, subscribeCheckoutRewardChanges } from "../lib/checkout-offers";
import { WELCOME_BACK_REWARD_KEY } from "../lib/cart-discounts";

test("late welcome confirmation and cross-tab reward changes refresh quotes", () => {
  const target = new EventTarget();
  let requests = 0;
  const unsubscribe = subscribeCheckoutRewardChanges(target, () => requests++);
  target.dispatchEvent(new Event("hume:welcome-back-reward-sync"));
  assert.equal(requests, 1);
  const storage = (key: string | null) => {
    const event = new Event("storage");
    Object.defineProperty(event, "key", { value: key });
    target.dispatchEvent(event);
  };
  storage("unrelated");
  assert.equal(requests, 1);
  storage(WELCOME_BACK_REWARD_KEY);
  storage(null);
  assert.equal(requests, 3);
  unsubscribe();
  target.dispatchEvent(new Event("hume:welcome-back-reward-sync"));
  assert.equal(requests, 3);
});

test("restore saved coupon without restoring unverified welcome eligibility", () => {
  assert.equal(savedCouponCode("hume_early_bird + WELCOME-BACK-5"), "HUME_EARLY_BIRD");
  assert.equal(savedCouponCode("WELCOME-BACK-10"), null);
  assert.equal(savedCouponCode(null), null);
  assert.equal(savedCouponCode("<invalid>"), null);
});

test("saved billing shows recorded discounts without repricing existing payments", () => {
  assert.equal(savedCheckoutDiscount(799, 0, 0, 719.1), 79.9);
  assert.equal(savedCheckoutDiscount(799, 0, 50, 769.1), 79.9);
  assert.equal(savedCheckoutDiscount(799, 100, 0, 899), 0);
  assert.equal(savedCheckoutDiscount(799, 0, 0, 900), 0);
  assert.equal(savedCheckoutDiscount(NaN, 0, 0, 719), 0);
});
