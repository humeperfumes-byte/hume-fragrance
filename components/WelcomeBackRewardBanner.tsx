"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import {
  getEffectiveWelcomeBackPercent,
  getWelcomeBackRewardId,
  readWelcomeBackReward,
  type WelcomeBackReward,
} from "@/lib/cart-discounts";

const REWARD_BANNER_DELAY_MS = 5000;
const REWARD_BANNER_VISIBLE_MS = 10000;

function shouldHideRewardBanner(pathname: string | null) {
  return (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/order-success")
  );
}

export function WelcomeBackRewardBannerCard({
  percent,
  onViewCart,
}: {
  percent: 5 | 10;
  onViewCart?: () => void;
}) {
  const isTenPercent = percent === 10;

  return (
    <div
      className={`relative flex w-full max-w-[500px] items-center gap-2 overflow-hidden rounded-[1.5rem] border p-3 shadow-[0_22px_60px_rgba(0,0,0,0.36),0_0_34px_rgba(180,106,48,0.22)] backdrop-blur-xl sm:gap-4 sm:rounded-[1.75rem] sm:p-4 ${
        isTenPercent
          ? "border-amber-200/10 bg-[#0c0805]/95"
          : "border-emerald-200/10 bg-[#050d08]/95"
      }`}
    >
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/35 to-transparent" />
      <span className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-700/35 to-transparent" />
      <span className="pointer-events-none absolute inset-y-[-20%] left-[-35%] z-10 w-24 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm [animation:hume-reward-sweep_1.6s_ease-out_0.22s_1_both]" />
      <span className="pointer-events-none absolute left-7 top-4 hidden h-1 w-1 rounded-full bg-amber-100 shadow-[0_0_14px_4px_rgba(253,230,138,0.42)] sm:block" />
      <span className="pointer-events-none absolute left-3 bottom-7 hidden h-1 w-1 rounded-full bg-amber-200/80 shadow-[0_0_12px_3px_rgba(251,191,36,0.35)] sm:block" />
      <span className="pointer-events-none absolute left-24 top-7 hidden h-1.5 w-1.5 rounded-full bg-amber-100/90 shadow-[0_0_18px_5px_rgba(253,230,138,0.46)] sm:block" />
      <div
        className={`pointer-events-none absolute inset-0 ${
          isTenPercent
            ? "bg-[radial-gradient(circle_at_14%_46%,rgba(153,27,27,0.58),transparent_26%),radial-gradient(circle_at_88%_48%,rgba(127,29,29,0.42),transparent_33%),radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.18),transparent_38%)]"
            : "bg-[radial-gradient(circle_at_14%_46%,rgba(6,95,70,0.58),transparent_26%),radial-gradient(circle_at_88%_48%,rgba(21,128,61,0.34),transparent_33%),radial-gradient(circle_at_50%_-20%,rgba(245,158,11,0.14),transparent_38%)]"
        }`}
      />
      <div
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-[0_0_22px_rgba(251,191,36,0.18)] sm:h-14 sm:w-14 ${
          isTenPercent
            ? "border-red-200/20 bg-red-800/70 text-red-50"
            : "border-emerald-200/20 bg-emerald-800/70 text-emerald-50"
        }`}
      >
        <Sparkles className="h-5 w-5 sm:h-7 sm:w-7" />
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="whitespace-normal text-[13px] font-semibold leading-snug text-white sm:text-base">
          Your {percent}% COMEBACK Reward is applied
        </p>
      </div>
      <button
        type="button"
        onClick={onViewCart}
        className={`relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition active:scale-[0.98] sm:h-11 sm:px-4 sm:text-sm ${
          isTenPercent
            ? "border-red-200/20 bg-red-800/75 hover:bg-red-700/85"
            : "border-emerald-200/20 bg-emerald-800/75 hover:bg-emerald-700/85"
        }`}
      >
        <span>View Cart</span>
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}

export default function WelcomeBackRewardBanner() {
  const pathname = usePathname();
  const hideBanner = shouldHideRewardBanner(pathname);
  const { isCartOpen, setIsCartOpen, totalItems, totalPrice } = useCart();
  const [reward, setReward] = useState<WelcomeBackReward | null>(null);
  const [visible, setVisible] = useState(false);
  const displayedRewardIdRef = useRef<string | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncReward = () => {
      if (hideBanner) {
        setVisible(false);
        setReward(null);
        if (revealTimeoutRef.current) {
          window.clearTimeout(revealTimeoutRef.current);
          revealTimeoutRef.current = null;
        }
        return;
      }

      const activeReward = readWelcomeBackReward(window.localStorage);
      setReward(activeReward);
      if (!activeReward || isCartOpen) return;

      const rewardId = getWelcomeBackRewardId(activeReward);
      if (displayedRewardIdRef.current === rewardId) return;

      displayedRewardIdRef.current = rewardId;
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      revealTimeoutRef.current = window.setTimeout(() => {
        setVisible(true);
      }, REWARD_BANNER_DELAY_MS);
    };

    syncReward();
    const interval = window.setInterval(syncReward, 10000);
    window.addEventListener("storage", syncReward);
    window.addEventListener("focus", syncReward);
    window.addEventListener("hume:welcome-back-reward-sync", syncReward);

    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
      window.clearInterval(interval);
      window.removeEventListener("storage", syncReward);
      window.removeEventListener("focus", syncReward);
      window.removeEventListener("hume:welcome-back-reward-sync", syncReward);
    };
  }, [hideBanner, isCartOpen]);

  useEffect(() => {
    if (!reward || isCartOpen || hideBanner) return;
    const timeout = window.setTimeout(() => setVisible(false), REWARD_BANNER_VISIBLE_MS);
    return () => window.clearTimeout(timeout);
  }, [hideBanner, isCartOpen, reward]);

  if (!reward || isCartOpen || hideBanner) return null;
  const effectivePercent = getEffectiveWelcomeBackPercent(reward, null, totalPrice) as 5 | 10;

  const handleViewCart = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("hume:tracking", {
          detail: {
            eventType: "reward_banner_click",
            payload: {
              source: "welcome_back_reward_banner",
              itemCount: totalItems,
              couponCode: reward.code,
              rewardLabel: reward.label,
              rewardPercent: effectivePercent,
              visitCount: reward.visitCount,
              expiresAt: reward.expiresAt,
            },
          },
        }),
      );
    }
    setIsCartOpen(true);
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 42, scale: 0.97, filter: "brightness(0.72) blur(4px)" }}
          animate={{
            opacity: 1,
            y: 0,
            scale: [0.97, 1.025, 1],
            filter: [
              "brightness(0.72) blur(4px)",
              "brightness(1.28) blur(0px)",
              "brightness(1) blur(0px)",
            ],
          }}
          exit={{ opacity: 0, y: 26, scale: 0.98, filter: "brightness(0.85) blur(4px)" }}
          transition={{
            duration: 0.72,
            ease: [0.16, 1, 0.3, 1],
            scale: { duration: 0.72, times: [0, 0.58, 1] },
            filter: { duration: 0.78, times: [0, 0.55, 1] },
          }}
          className="fixed inset-x-0 bottom-4 z-[65] flex justify-center px-3 sm:bottom-6 sm:px-4"
        >
          <WelcomeBackRewardBannerCard
            percent={effectivePercent}
            onViewCart={handleViewCart}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
