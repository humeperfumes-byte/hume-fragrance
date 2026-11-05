"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Coins, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getStoredAccountLoginToken } from "@/lib/customer-account";
const subscribeToLogin = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener("focus", notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("focus", notify);
  };
};
const loginSnapshot = () => {
  try { return Boolean(getStoredAccountLoginToken(localStorage)); } catch { return false; }
};
export default function CoinRedemption() {
  const {
    coinsToUse,
    setCoinsToUse,
    growthQuote,
    growthQuotePending,
    growthQuoteError,
    refreshGrowthQuote,
    setAppliedCouponCode,
  } = useCart();
  const logged = useSyncExternalStore(subscribeToLogin, loginSnapshot, () => false);
  return (
    <section className="my-4 rounded-2xl border border-[#d5c2a3] bg-[#faf5ed] p-4 text-[#3c291d]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Coins size={17} />
          HUME Coins
        </h3>
        <span className="text-[10px] text-[#8a715d]">1 coin = ₹1</span>
      </div>
      {!logged ? (
        <p className="mt-2 text-xs">
          <Link href="/account" className="font-semibold underline">
            Verify your account
          </Link>{" "}
          to see and use your coins.
        </p>
      ) : (
        <>
          <p className="mt-2 text-xs text-[#8a715d]">
            Available for this bag: {growthQuote?.walletAvailable ?? "…"} coins
          </p>
          <label className="mt-3 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={coinsToUse > 0}
              disabled={!coinsToUse && !growthQuote?.maxCoins}
              onChange={(e) =>
                setCoinsToUse(e.target.checked ? growthQuote?.maxCoins || 0 : 0)
              }
            />
            Use coins on this order
          </label>
          {coinsToUse > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <input
                aria-label="Coins to redeem"
                type="number"
                min={0}
                max={growthQuote?.maxCoins || 100000}
                value={coinsToUse}
                onChange={(e) =>
                  setCoinsToUse(
                    Math.max(0, Math.trunc(Number(e.target.value) || 0)),
                  )
                }
                className="w-24 rounded-lg border border-[#d5c2a3] bg-white px-3 py-2 text-sm"
              />
              <span className="text-xs">
                −₹{growthQuote?.coins ?? coinsToUse}
              </span>
              <button
                type="button"
                onClick={() => setCoinsToUse(0)}
                className="ml-auto text-xs underline"
              >
                Remove
              </button>
            </div>
          )}
          <p className="mt-2 text-[10px] leading-relaxed text-[#8a715d]">
            Using coins is optional. Unused coins stay in your wallet. Cart
            reservations expire after 30 minutes; saved orders keep their coins
            reserved until paid or cancelled.
          </p>
        </>
      )}
      {growthQuote?.referralDiscount ? (
        <p className="mt-2 text-xs text-emerald-700">
          Referral offer: −₹{growthQuote.referralDiscount}
        </p>
      ) : null}
      {growthQuote?.freeSample ? (
        <p className="mt-2 text-xs text-emerald-700">
          Complimentary sample included with your offer.
        </p>
      ) : null}
      {growthQuotePending && (
        <p role="status" className="mt-2 text-xs">
          Refreshing your total…
        </p>
      )}
      {growthQuoteError && (
        <div role="alert" className="mt-2 text-xs text-red-700">
          <p>{growthQuoteError}</p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={refreshGrowthQuote}
              className="inline-flex items-center gap-1 underline"
            >
              <RefreshCw size={12} />
              Retry
            </button>
            <button
              type="button"
              className="underline"
              onClick={() => {
                setAppliedCouponCode(null);
                setCoinsToUse(0);
              }}
            >
              Remove offers
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
