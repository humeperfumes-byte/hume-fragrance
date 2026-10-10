import { calculateCouponDiscount, calculateWelcomeBackDiscount, createWelcomeBackReward } from "./cart-discounts";
import type { CouponLike } from "./cart-discounts";
import type { AdminControls } from "./admin-settings";
import type { CartItem } from "@/context/CartContext";
export function priceSecureCart(items: CartItem[], coupon: CouponLike | null, welcomePercent: 0 | 5 | 10, controls: AdminControls) {
  const subtotal = items.filter(item => !item.isGift).reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100;
  const couponDiscount = Math.min(subtotal, calculateCouponDiscount(coupon, items, subtotal).discount);
  const allDiscovery = items.filter(item => !item.isGift).every(item => item.sampleSelections?.length);
  const reward = controls.welcomeBackEnabled && !allDiscovery && welcomePercent ? createWelcomeBackReward(welcomePercent, Date.now(), 3) : null;
  const welcomeDiscount = calculateWelcomeBackDiscount(reward, subtotal, couponDiscount, coupon);
  const shippingFee = welcomeDiscount > 0 ? 0 : subtotal < controls.freeDeliveryThreshold ? controls.shippingChargeBelowThreshold : 0;
  const grandTotal = Math.round((Math.max(0, subtotal - couponDiscount - welcomeDiscount) + shippingFee) * 100) / 100;
  return { subtotal, shippingFee, grandTotal };
}
export function expectedPaymentMinor(total: number, partial: boolean) {
  return Math.max(100, Math.round((partial ? Math.max(1, Math.round(total * 0.2)) : total) * 100));
}
export function storedPaymentMinor(frozenMinor: number | null | undefined, total: number, partial: boolean) {
  return frozenMinor && Number.isSafeInteger(frozenMinor) && frozenMinor >= 100 ? frozenMinor : expectedPaymentMinor(total, partial);
}
export function matchesCapturedPayment(payment: { order_id?: string; amount?: number | string; currency?: string; status?: string }, orderId: string, expected: number) {
  return payment.order_id === orderId && Number(payment.amount) === expected && payment.currency === "INR" && payment.status === "captured";
}
