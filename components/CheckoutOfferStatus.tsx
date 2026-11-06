"use client";

import { useCart } from "@/context/CartContext";

export default function CheckoutOfferStatus() {
  const { growthQuoteError, refreshGrowthQuote, appliedCouponCode, setAppliedCouponCode } = useCart();
  if (!growthQuoteError) return null;
  return <div role="alert" className="my-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
    <p>{growthQuoteError}</p>
    <div className="mt-2 flex gap-4">
      <button type="button" className="underline" onClick={refreshGrowthQuote}>Retry offer</button>
      {appliedCouponCode && <button type="button" className="underline" onClick={() => setAppliedCouponCode(null)}>Remove coupon</button>}
    </div>
  </div>;
}
