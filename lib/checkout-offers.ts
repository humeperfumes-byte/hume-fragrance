import { WELCOME_BACK_REWARD_KEY } from "./cart-discounts";

/** Visit eligibility can arrive after the initial cart quote. */
export function subscribeCheckoutRewardChanges(target: EventTarget, refresh: () => void) {
  const handle = (event: Event) => {
    if (event.type === "hume:welcome-back-reward-sync" ||
      (event.type === "storage" && ((event as StorageEvent).key === WELCOME_BACK_REWARD_KEY || (event as StorageEvent).key === null))) refresh();
  };
  target.addEventListener("hume:welcome-back-reward-sync", handle);
  target.addEventListener("storage", handle);
  return () => {
    target.removeEventListener("hume:welcome-back-reward-sync", handle);
    target.removeEventListener("storage", handle);
  };
}

/** Restore the saved coupon; welcome eligibility still comes from the server. */
export function savedCouponCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.split(/\s*\+\s*/).map(code => code.trim().toUpperCase())
    .find(code => !/^WELCOME-BACK-(5|10)$/.test(code) && /^[A-Z0-9_-]{1,100}$/.test(code)) || null;
}

export function savedCheckoutDiscount(subtotal: number, shippingFee: number, codFee: number, total: number): number {
  if (![subtotal, shippingFee, codFee, total].every(Number.isFinite)) return 0;
  return Math.max(0, Math.round((subtotal + shippingFee + codFee - total) * 100) / 100);
}
