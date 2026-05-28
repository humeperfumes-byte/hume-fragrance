"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  X,
  Minus,
  Plus,
  Gift,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { stripRegionPrefix } from "@/lib/region-routing";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";
import {
  calculateCouponDiscount,
  calculateWelcomeBackDiscount,
  formatRewardTimeRemaining,
  getEffectiveWelcomeBackCode,
  getEffectiveWelcomeBackLabel,
  getEffectiveWelcomeBackPercent,
  isCouponEligible as isCartCouponEligible,
  parseBuyGetConfig,
  trackWelcomeBackVisit,
  type WelcomeBackReward,
} from "@/lib/cart-discounts";
import { DISCOVERY_SET_IMAGES, DISCOVERY_SET_PRICE, DISCOVERY_SET_PATH } from "@/lib/discovery-set";

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minSubtotal: number;
  active: boolean;
  displayInCart?: boolean;
  welcomeBackMode?: string;
}

const APPLIED_COUPON_STORAGE_KEY = "hume_applied_coupon_code";
const SPECIAL5_CODE = "SPECIAL-5";
const REWARD_CONFETTI = [
  { left: "4%", top: "-8%", delay: 0, x: -18, color: "#16a34a" },
  { left: "10%", top: "-12%", delay: 0.1, x: 22, color: "#0f766e" },
  { left: "16%", top: "-6%", delay: 0.22, x: -12, color: "#facc15" },
  { left: "23%", top: "-10%", delay: 0.04, x: 28, color: "#22c55e" },
  { left: "31%", top: "-14%", delay: 0.16, x: -24, color: "#15803d" },
  { left: "38%", top: "-7%", delay: 0.28, x: 16, color: "#bef264" },
  { left: "46%", top: "-11%", delay: 0.08, x: -28, color: "#059669" },
  { left: "54%", top: "-5%", delay: 0.2, x: 18, color: "#fde68a" },
  { left: "62%", top: "-13%", delay: 0.12, x: -16, color: "#84cc16" },
  { left: "69%", top: "-8%", delay: 0.3, x: 28, color: "#14b8a6" },
  { left: "77%", top: "-15%", delay: 0.18, x: -20, color: "#d9f99d" },
  { left: "84%", top: "-6%", delay: 0.02, x: 14, color: "#10b981" },
  { left: "92%", top: "-10%", delay: 0.24, x: -26, color: "#fef3c7" },
  { left: "97%", top: "-12%", delay: 0.06, x: 18, color: "#65a30d" },
];

const URGENT_REWARD_CONFETTI = [
  { left: "4%", top: "-8%", delay: 0, x: -18, color: "#ef4444" },
  { left: "10%", top: "-12%", delay: 0.1, x: 22, color: "#991b1b" },
  { left: "16%", top: "-6%", delay: 0.22, x: -12, color: "#f97316" },
  { left: "23%", top: "-10%", delay: 0.04, x: 28, color: "#dc2626" },
  { left: "31%", top: "-14%", delay: 0.16, x: -24, color: "#7f1d1d" },
  { left: "38%", top: "-7%", delay: 0.28, x: 16, color: "#fecaca" },
  { left: "46%", top: "-11%", delay: 0.08, x: -28, color: "#f43f5e" },
  { left: "54%", top: "-5%", delay: 0.2, x: 18, color: "#fed7aa" },
  { left: "62%", top: "-13%", delay: 0.12, x: -16, color: "#b91c1c" },
  { left: "69%", top: "-8%", delay: 0.3, x: 28, color: "#fb7185" },
  { left: "77%", top: "-15%", delay: 0.18, x: -20, color: "#fee2e2" },
  { left: "84%", top: "-6%", delay: 0.02, x: 14, color: "#f59e0b" },
  { left: "92%", top: "-10%", delay: 0.24, x: -26, color: "#fca5a5" },
  { left: "97%", top: "-12%", delay: 0.06, x: 18, color: "#7f1d1d" },
];

const CartDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const freeDeliveryThreshold = 500;
  const deliveryChargeBelowThreshold = 100;
  const firstGiftThreshold = 1499;
  const secondGiftThreshold = 2099;

  const [visibleCoupons, setVisibleCoupons] = useState<Coupon[]>([]);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );
  const [couponInput, setCouponInput] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [welcomeBackReward, setWelcomeBackReward] =
    useState<WelcomeBackReward | null>(null);
  const [rewardUnlockOpen, setRewardUnlockOpen] = useState(false);
  const [rewardNow, setRewardNow] = useState(() => Date.now());
  const [priceMagicActive, setPriceMagicActive] = useState(false);
  const [priceMagicStage, setPriceMagicStage] = useState<
    "idle" | "old" | "strike" | "calculate" | "new"
  >("idle");
  const wasCartOpenRef = useRef(false);
  const wasRewardUnlockOpenRef = useRef(false);
  const { prefix: currentPrefix } = stripRegionPrefix(pathname || "/");
  const isIndiaRootStorefront = currentPrefix === "";
  const listableCoupons = isIndiaRootStorefront ? visibleCoupons : [];

  const subtotal = totalPrice;
  const paidItemCount = items.reduce(
    (sum, item) => sum + (item.isGift ? 0 : item.quantity),
    0,
  );
  const appliedCoupon = useMemo(
    () =>
      allCoupons.find(
        (coupon) =>
          coupon.code.toUpperCase() === (appliedCouponCode ?? "").toUpperCase(),
      ) ?? null,
    [allCoupons, appliedCouponCode],
  );

  const regularShippingFee =
    subtotal > 0 && subtotal < freeDeliveryThreshold
      ? deliveryChargeBelowThreshold
      : 0;

  const couponResult = useMemo(
    () => calculateCouponDiscount(appliedCoupon, items, subtotal),
    [appliedCoupon, items, subtotal],
  );

  const normalizedCouponDiscount = Math.min(subtotal, couponResult.discount);
  const welcomeBackDiscount = calculateWelcomeBackDiscount(
    welcomeBackReward,
    subtotal,
    normalizedCouponDiscount,
    appliedCoupon,
  );
  const effectiveWelcomeBackPercent = getEffectiveWelcomeBackPercent(
    welcomeBackReward,
    appliedCoupon,
    subtotal,
  );
  const welcomeBackLabel = getEffectiveWelcomeBackLabel(
    welcomeBackReward,
    appliedCoupon,
    subtotal,
  );
  const effectiveWelcomeBackCode = getEffectiveWelcomeBackCode(
    welcomeBackReward,
    appliedCoupon,
    subtotal,
  );
  const hasWelcomeBackBenefit = effectiveWelcomeBackPercent > 0;
  const shippingFee = hasWelcomeBackBenefit ? 0 : regularShippingFee;
  const shippingSavings = Math.max(0, regularShippingFee - shippingFee);
  const grandTotal =
    Math.max(0, subtotal - normalizedCouponDiscount - welcomeBackDiscount) +
    shippingFee;
  const totalSavings =
    normalizedCouponDiscount + welcomeBackDiscount + shippingSavings;
  const pricingBreakdown = useMemo(
    () => ({
      subtotal,
      regularShippingFee,
      shippingFee,
      couponCode: appliedCouponCode,
      couponLabel: appliedCoupon?.description || appliedCoupon?.code || null,
      couponDiscount: normalizedCouponDiscount,
      welcomeBackCode: hasWelcomeBackBenefit ? effectiveWelcomeBackCode : null,
      welcomeBackLabel,
      welcomeBackPercent: effectiveWelcomeBackPercent,
      welcomeBackDiscount,
      shippingSavings,
      grandTotal,
      totalSavings,
      appliedOfferCodes: [appliedCouponCode, hasWelcomeBackBenefit ? effectiveWelcomeBackCode : null]
        .filter(Boolean)
        .join(" + ") || null,
    }),
    [
      appliedCoupon?.code,
      appliedCoupon?.description,
      appliedCouponCode,
      effectiveWelcomeBackCode,
      effectiveWelcomeBackPercent,
      grandTotal,
      hasWelcomeBackBenefit,
      normalizedCouponDiscount,
      regularShippingFee,
      shippingFee,
      shippingSavings,
      subtotal,
      totalSavings,
      welcomeBackDiscount,
      welcomeBackLabel,
    ],
  );
  const appliedPercentOff =
    appliedCoupon &&
    appliedCoupon.type === "percent" &&
    normalizedCouponDiscount > 0
      ? Math.max(0, appliedCoupon.value)
      : 0;
  const stackedPercentOff =
    appliedPercentOff + effectiveWelcomeBackPercent;
  const rewardTimeRemaining = welcomeBackReward && hasWelcomeBackBenefit
    ? Math.max(0, welcomeBackReward.expiresAt - rewardNow)
    : 0;
  const rewardTease =
    effectiveWelcomeBackPercent === 10
      ? "Still deciding? Bigger secret unlocked ;)"
      : "2nd visit? Secret reward unlocked ;)";
  const isUrgentReward = effectiveWelcomeBackPercent === 10;

  const unlockedGiftCount =
    subtotal >= secondGiftThreshold
      ? 2
      : subtotal >= firstGiftThreshold
        ? 1
        : 0;
  const amountToFirstGift = Math.max(0, firstGiftThreshold - subtotal);
  const amountToSecondGift = Math.max(0, secondGiftThreshold - subtotal);
  const giftProgress = Math.min(100, (subtotal / secondGiftThreshold) * 100);

  const progressMessage =
    subtotal < firstGiftThreshold
      ? `Add ${formatINR(amountToFirstGift)} more for Gift 1`
      : subtotal < secondGiftThreshold
        ? `Add ${formatINR(amountToSecondGift)} more for Gift 2`
        : "Gift 1 and Gift 2 unlocked";

  const isCouponEligible = useCallback(
    (coupon: Coupon) => isCartCouponEligible(coupon, items, subtotal),
    [items, subtotal],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCode = window.localStorage
      .getItem(APPLIED_COUPON_STORAGE_KEY)
      ?.trim()
      .toUpperCase();
    if (storedCode === SPECIAL5_CODE) {
      window.localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
      setCouponInput("");
      return;
    }
    if (!storedCode) return;
    setAppliedCouponCode(storedCode);
    setCouponInput(storedCode);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const result = trackWelcomeBackVisit(window.localStorage);
    setWelcomeBackReward(result.reward);
    if (result.reward) {
      window.dispatchEvent(new CustomEvent("hume:welcome-back-reward-sync"));
    }

    if (result.justUnlocked && result.reward) {
      window.dispatchEvent(
        new CustomEvent("hume:tracking", {
          detail: {
            eventType: "coupon_auto_applied",
            payload: {
              couponCode: result.reward.code,
              rewardLabel: result.reward.label,
              rewardPercent: result.reward.percent,
              trigger: "welcome_back_visit",
              visitCount: result.visitCount,
              expiresAt: result.reward.expiresAt,
            },
          },
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (!welcomeBackReward) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setRewardNow(now);
      if (welcomeBackReward.expiresAt <= now) {
        setWelcomeBackReward(null);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [welcomeBackReward]);

  useEffect(() => {
    let active = true;
    const loadCoupons = async () => {
      try {
        const [visibleResponse, allResponse] = await Promise.all([
          fetch("/api/coupons"),
          fetch("/api/coupons?includeHidden=1"),
        ]);
        if (!visibleResponse.ok || !allResponse.ok)
          throw new Error("Failed to fetch coupons");

        const visibleData = (await visibleResponse.json()) as Coupon[];
        const allData = (await allResponse.json()) as Coupon[];

        if (active) {
          setVisibleCoupons(Array.isArray(visibleData) ? visibleData : []);
          setAllCoupons(Array.isArray(allData) ? allData : []);
        }
      } catch (error) {
        console.error("Failed to load coupons:", error);
      }
    };
    loadCoupons();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isCartOpen || items.length === 0) return;
    router.prefetch("/checkout");
  }, [isCartOpen, items.length, router]);

  useEffect(() => {
    if (!isCartOpen || items.length === 0 || typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "cart_open",
          payload: {
            itemCount: totalItems,
            subtotal,
            grandTotal,
            appliedCouponCode,
            couponDiscount: normalizedCouponDiscount,
            welcomeBackLabel,
            welcomeBackDiscount,
            shippingSavings,
            pricingBreakdown,
            products: items.map((item) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              isGift: item.isGift,
            })),
          },
        },
      }),
    );
  }, [
    appliedCouponCode,
    grandTotal,
    isCartOpen,
    items,
    normalizedCouponDiscount,
    pricingBreakdown,
    shippingSavings,
    subtotal,
    totalItems,
    welcomeBackDiscount,
    welcomeBackLabel,
  ]);

  useEffect(() => {
    if (!appliedCoupon || normalizedCouponDiscount <= 0 || typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "coupon_auto_applied",
          payload: {
            couponCode: appliedCoupon.code,
            rewardLabel: appliedCoupon.description,
            trigger: "manual_coupon_apply",
            pricingBreakdown,
          },
        },
      }),
    );
  }, [appliedCoupon, normalizedCouponDiscount, pricingBreakdown]);

  useEffect(() => {
    if (!isCartOpen || typeof window === "undefined") return;

    const scrollY = window.scrollY;
    const previousBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    const previousHtmlOverscroll =
      document.documentElement.style.overscrollBehavior;

    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overscrollBehavior =
        previousHtmlOverscroll;
      document.body.style.overflow = previousBodyStyles.overflow;
      document.body.style.position = previousBodyStyles.position;
      document.body.style.top = previousBodyStyles.top;
      document.body.style.width = previousBodyStyles.width;
      window.scrollTo(0, scrollY);
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (!appliedCouponCode) return;
    if (allCoupons.length === 0) return;
    if (!appliedCoupon) {
      setAppliedCouponCode(null);
      return;
    }
    if (
      subtotal < appliedCoupon.minSubtotal ||
      !isCouponEligible(appliedCoupon)
    ) {
      setAppliedCouponCode(null);
    }
  }, [
    allCoupons.length,
    appliedCoupon,
    appliedCouponCode,
    isCouponEligible,
    subtotal,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const justOpened = isCartOpen && !wasCartOpenRef.current;
    wasCartOpenRef.current = isCartOpen;

    if (!justOpened || items.length === 0 || !welcomeBackReward) return;
    if (welcomeBackReward.expiresAt <= Date.now()) return;

    setRewardUnlockOpen(true);
  }, [isCartOpen, items.length, welcomeBackReward]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!appliedCouponCode) {
      window.localStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(APPLIED_COUPON_STORAGE_KEY, appliedCouponCode);
  }, [appliedCouponCode]);

  useEffect(() => {
    if (!rewardUnlockOpen) return;
    const timeout = window.setTimeout(() => setRewardUnlockOpen(false), 3200);
    return () => window.clearTimeout(timeout);
  }, [rewardUnlockOpen]);

  useEffect(() => {
    if (rewardUnlockOpen) {
      wasRewardUnlockOpenRef.current = true;
      setPriceMagicActive(false);
      return;
    }

    if (!wasRewardUnlockOpenRef.current) return;
    wasRewardUnlockOpenRef.current = false;
    setPriceMagicActive(true);
    setPriceMagicStage("old");

    const strikeTimeout = window.setTimeout(
      () => setPriceMagicStage("strike"),
      1100,
    );
    const calculateTimeout = window.setTimeout(
      () => setPriceMagicStage("calculate"),
      2900,
    );
    const newTimeout = window.setTimeout(() => setPriceMagicStage("new"), 4050);
    const endTimeout = window.setTimeout(() => {
      setPriceMagicActive(false);
      setPriceMagicStage("idle");
    }, 5800);

    return () => {
      window.clearTimeout(strikeTimeout);
      window.clearTimeout(calculateTimeout);
      window.clearTimeout(newTimeout);
      window.clearTimeout(endTimeout);
    };
  }, [rewardUnlockOpen]);

  const handleApplyToggleCoupon = (coupon: Coupon) => {
    if (appliedCouponCode === coupon.code) {
      setAppliedCouponCode(null);
      toast({
        title: "Coupon removed",
      });
      return;
    }
    if (!isCouponEligible(coupon)) {
      const buyGet = parseBuyGetConfig(coupon);
      if (buyGet && paidItemCount < buyGet.buy + buyGet.get) {
        const requiredItems = buyGet.buy + buyGet.get;
        toast({
          title: "Coupon not eligible",
          description: `Add ${requiredItems - paidItemCount} more item(s) to unlock ${coupon.code}.`,
        });
        return;
      }
      toast({
        title: "Coupon not eligible",
        description: `Add ${formatINR(coupon.minSubtotal - subtotal)} more to apply ${coupon.code}.`,
      });
      return;
    }
    setAppliedCouponCode(coupon.code);
    toast({
      title: "Coupon applied",
    });
  };

  const handleApplyCouponFromInput = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast({
        title: "Enter a coupon code",
        description: "Type a valid coupon code to apply.",
      });
      return;
    }

    const coupon = allCoupons.find((c) => c.code.toUpperCase() === code);
    if (!coupon) {
      toast({
        title: "Invalid coupon",
        description: "This coupon code is not available right now.",
      });
      return;
    }

    if (!isCouponEligible(coupon)) {
      const buyGet = parseBuyGetConfig(coupon);
      if (buyGet && paidItemCount < buyGet.buy + buyGet.get) {
        const requiredItems = buyGet.buy + buyGet.get;
        toast({
          title: "Coupon not eligible",
          description: `Add ${requiredItems - paidItemCount} more item(s) to unlock ${coupon.code}.`,
        });
        return;
      }
      toast({
        title: "Coupon not eligible",
        description: `Add ${formatINR(coupon.minSubtotal - subtotal)} more to apply ${coupon.code}.`,
      });
      return;
    }

    setAppliedCouponCode(coupon.code);
    setCouponInput("");
    toast({
      title: "Coupon applied",
    });
  };

  const handleContinueCheckout = () => {
    setIsCartOpen(false);
    router.prefetch("/checkout");
    showNavigationLoadingToast("Opening checkout");
    router.push("/checkout");
  };

  const renderSidebarCartLayout = () => (
    <>
      <header className="shrink-0 border-b border-black/10 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.7rem] leading-none tracking-tight">
              Your Selection
            </h2>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-black/45">
              {appliedCoupon
                ? `${appliedCoupon.code} active`
                : `${totalItems} item${totalItems === 1 ? "" : "s"} in cart`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="flex h-9 w-9 items-center justify-center text-black/45 transition hover:text-black"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 py-4 scrollbar-none"
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="font-serif text-3xl leading-tight">
              Your selection is empty
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-black/50">
              Add a fragrance to unlock cart offers, free delivery, and gift
              rewards.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                showNavigationLoadingToast();
                router.push("/shop");
              }}
              className="mt-6 h-11 bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Shop Fragrances
            </button>
          </div>
        ) : (
          <>
            {welcomeBackReward && welcomeBackLabel && rewardTimeRemaining > 0 ? (
              <section
                className={`mb-4 overflow-hidden border text-white shadow-[0_14px_34px_rgba(21,17,12,0.16)] ${
                  isUrgentReward
                    ? "border-[#ef4444]/45 bg-[#1b0708]"
                    : "border-[#d6c7aa] bg-[#15110c]"
                }`}
              >
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Extra {effectiveWelcomeBackPercent}% off + free delivery
                    </p>
                    <p className="mt-1.5 w-full text-xs leading-snug text-white/65">
                      <span className="mr-1.5 text-[13px] text-white opacity-100">
                        🤫
                      </span>
                      <span>{rewardTease}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-[0.16em] ${
                        isUrgentReward ? "text-red-100/55" : "text-amber-100/50"
                      }`}
                    >
                      Ends in
                    </p>
                    <p
                      className={`mt-1 font-mono text-sm font-semibold tabular-nums ${
                        isUrgentReward ? "text-red-100" : "text-amber-100"
                      }`}
                    >
                      {formatRewardTimeRemaining(rewardTimeRemaining)}
                    </p>
                  </div>
                </div>
                <motion.div
                  className={
                    isUrgentReward ? "h-1 bg-red-400" : "h-1 bg-amber-200"
                  }
                  initial={false}
                  animate={{
                    width: `${Math.max(0, Math.min(100, (rewardTimeRemaining / (24 * 60 * 60 * 1000)) * 100))}%`,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </section>
            ) : null}

            <section className="rounded-[4px] border border-black/10 bg-[#f4f0f5] p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/60">
                    {unlockedGiftCount >= 2
                      ? "Gift 2 Unlocked"
                      : unlockedGiftCount === 1
                        ? "Unlock Gift 2"
                        : "Unlock Gift 1"}
                  </p>
                  <p className="mt-1 text-sm text-black/70">
                    {progressMessage}
                  </p>
                </div>
                <Gift className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="mt-4 h-2 overflow-hidden bg-black/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${giftProgress}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-full bg-[#0f3a2b]"
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-black/35">
                <span>{formatINR(0)}</span>
                <span>{formatINR(firstGiftThreshold)}</span>
                <span>{formatINR(secondGiftThreshold)} goal</span>
              </div>
            </section>

            <section className="mt-5 divide-y divide-black/10 border-y border-black/10">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const freeUnitsFromCoupon =
                    couponResult.freeUnitByItemId.get(item.id) ?? 0;
                  const paidUnits = Math.max(
                    0,
                    item.quantity - freeUnitsFromCoupon,
                  );
                  const lineTotal = paidUnits * item.price;
                  const isLineFullyFree =
                    item.isGift || (freeUnitsFromCoupon > 0 && paidUnits === 0);
                  const lineDiscount =
                    !item.isGift && stackedPercentOff > 0
                      ? (lineTotal * stackedPercentOff) / 100
                      : 0;
                  const discountedLineTotal = Math.max(
                    0,
                    lineTotal - lineDiscount,
                  );

                  return (
                    <motion.article
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      className="grid grid-cols-[82px_minmax(0,1fr)_auto] gap-3 py-4"
                    >
                      <div className="relative h-20 w-20 overflow-hidden bg-[#eee9e3]">
                        <ImageWithFallback
                          src={withCloudinaryTransforms(
                            item.image || "/images/logo.png",
                            { width: 180 },
                          )}
                          fallbackSrc="/images/logo.png"
                          alt={item.name}
                          fill
                          sizes="82px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold leading-tight">
                          {item.name}
                        </p>
                        <p
                          className={`${item.isGift ? "hidden " : ""}mt-1 line-clamp-2 text-xs leading-snug text-black/50`}
                        >
                          {item.inspiration} {item.size ? `• ${item.size}` : ""}
                        </p>
                        {item.sampleSelections?.length ? (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-emerald-700">
                            Samples: {item.sampleSelections.map((selection) => selection.name).join(", ")}
                          </p>
                        ) : null}

                        {item.isGift ? (
                          <div className="mt-3 flex items-center gap-2">
                            <span className="bg-[#0f3a2b] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.11em] text-white">
                              Unlocked
                            </span>
                            <span className="text-xs text-black/45">
                              Qty {item.quantity}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-3 inline-flex h-8 items-center border border-black/10 bg-white">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="flex h-8 w-8 items-center justify-center transition hover:bg-black/5"
                              aria-label={`Decrease ${item.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="flex h-8 w-8 items-center justify-center border-x border-black/10 text-xs">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="flex h-8 w-8 items-center justify-center transition hover:bg-black/5"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-[58px] flex-col items-end justify-between">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-black/35 transition hover:text-red-600"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="text-right">
                          {isLineFullyFree ? (
                            <p className="text-sm font-semibold text-[#0f3a2b]">
                              Free
                            </p>
                          ) : lineDiscount > 0 ? (
                            priceMagicActive ? (
                              <motion.div
                                key={`magic-${item.id}-${discountedLineTotal}-${priceMagicStage}`}
                                initial={{ opacity: 0, scale: 0.94, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="relative flex min-h-12 min-w-[110px] flex-col items-end justify-center"
                              >
                                {(priceMagicStage === "old" ||
                                  priceMagicStage === "strike") && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                      duration: 0.28,
                                      ease: "easeOut",
                                    }}
                                    className="relative flex h-9 min-w-[104px] items-center justify-center border border-black/15 bg-white px-3"
                                  >
                                    <span className="relative text-sm font-semibold text-black">
                                      {formatINR(lineTotal)}
                                      {priceMagicStage === "strike" && (
                                        <motion.span
                                          initial={{ scaleX: 0 }}
                                          animate={{ scaleX: 1 }}
                                          transition={{
                                            duration: 1.35,
                                            ease: "easeOut",
                                          }}
                                          className="absolute left-[-5px] right-[-5px] top-1/2 h-[2px] origin-left -translate-y-1/2 bg-red-500"
                                        />
                                      )}
                                    </span>
                                  </motion.div>
                                )}

                                {priceMagicStage === "calculate" && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{
                                      opacity: 1,
                                      scale: [0.96, 1.04, 1],
                                    }}
                                    transition={{
                                      duration: 0.42,
                                      ease: "easeOut",
                                    }}
                                    className="relative flex h-9 min-w-[104px] items-center justify-center overflow-hidden border border-[#0f3a2b] bg-[#0f3a2b] px-3 text-white"
                                  >
                                    <motion.span
                                      initial={{ x: "-120%" }}
                                      animate={{ x: "120%" }}
                                      transition={{
                                        duration: 0.9,
                                        repeat: 1,
                                        ease: "easeInOut",
                                      }}
                                      className="absolute inset-y-0 w-10 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                                    />
                                    <span className="relative text-[10px] font-semibold uppercase tracking-[0.14em]">
                                      Repricing
                                    </span>
                                  </motion.div>
                                )}

                                {priceMagicStage === "new" && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 14, scale: 0.82 }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                      scale: [0.82, 1.12, 1],
                                    }}
                                    transition={{
                                      duration: 0.58,
                                      ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="relative flex h-9 min-w-[104px] items-center justify-center border border-[#b8e6c8] bg-[#eaf5ed] px-3"
                                  >
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.7 }}
                                      animate={{
                                        opacity: [0, 0.28, 0],
                                        scale: [0.7, 1.35, 1.75],
                                      }}
                                      transition={{
                                        duration: 0.9,
                                        ease: "easeOut",
                                      }}
                                      className="absolute h-12 w-24 rounded-full bg-[#0f6b46]/30 blur-md"
                                    />
                                    <span className="relative text-sm font-semibold text-[#0f6b46]">
                                      {formatINR(discountedLineTotal)}
                                    </span>
                                  </motion.div>
                                )}

                                {priceMagicStage === "new" && (
                                  <motion.p
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={{
                                      opacity: [0, 1, 0],
                                      y: [3, 0, -2],
                                    }}
                                    transition={{
                                      duration: 1.3,
                                      delay: 0.28,
                                      ease: "easeOut",
                                    }}
                                    className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0f6b46]"
                                  >
                                    Discount applied
                                  </motion.p>
                                )}
                              </motion.div>
                            ) : (
                              <div>
                                <p className="text-[11px] font-medium text-black/35 line-through">
                                  {formatINR(lineTotal)}
                                </p>
                                <p className="text-sm font-semibold">
                                  {formatINR(discountedLineTotal)}
                                </p>
                              </div>
                            )
                          ) : (
                            <p className="text-sm font-semibold">
                              {formatINR(
                                lineTotal > 0 ? lineTotal : item.price,
                              )}
                            </p>
                          )}
                          {freeUnitsFromCoupon > 0 && !item.isGift ? (
                            <p className="mt-1 text-[10px] text-[#0f6b46]">
                              {freeUnitsFromCoupon} free
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </section>

            {(allCoupons.length > 0 || appliedCoupon) && (
              <section className="mt-5 overflow-hidden border border-[#d8d0c8] bg-[#fbf7fb] text-black shadow-[0_12px_34px_rgba(24,18,14,0.04)]">
                {appliedCoupon ? (
                  <div className="border-b border-[#e4dde2] p-4">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/45">
                          Applied code
                        </p>
                        <p className="mt-1.5 font-serif text-[1.4rem] font-semibold leading-none tracking-wide">
                          {appliedCoupon.code}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCouponCode(null);
                        }}
                        className="h-6 border-b border-black/45 text-xs font-semibold tracking-[0.12em] text-black/65 transition hover:border-black hover:text-black"
                      >
                        Remove
                      </button>
                    </div>

                    {normalizedCouponDiscount > 0 && (
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <p className="text-[0.92rem] font-medium leading-none text-[#0f3a2b]">
                          You save {formatINR(normalizedCouponDiscount)}
                        </p>
                        <span className="bg-[#d7f1df] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f6b46]">
                          Applied
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e4dde2] px-4">
                    <input
                      value={couponInput}
                      onChange={(e) =>
                        setCouponInput(e.target.value.toUpperCase())
                      }
                      placeholder="Enter code"
                      className="h-10 min-w-0 bg-transparent text-sm font-semibold uppercase tracking-[0.08em] text-black outline-none placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-black/25"
                      aria-label="Offer code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCouponFromInput}
                      disabled={!couponInput.trim()}
                      className="inline-flex h-8 min-w-[70px] items-center justify-center border border-black/75 bg-transparent px-3 text-[11px] font-semibold tracking-[0.1em] text-black transition hover:bg-black hover:text-white disabled:border-black/20 disabled:text-black/25 disabled:hover:bg-transparent disabled:hover:text-black/25"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {listableCoupons.length > 0 && (
                  <div className="divide-y divide-[#e4dde2]">
                    {listableCoupons
                      .filter(
                        (coupon) =>
                          coupon.code.toUpperCase() !==
                          (appliedCouponCode ?? "").toUpperCase(),
                      )
                      .map((coupon) => {
                        const isEligible = isCouponEligible(coupon);
                        const buyGet = parseBuyGetConfig(coupon);
                        const offerText =
                          coupon.type === "percent"
                            ? `${coupon.value}% off`
                            : coupon.type === "fixed"
                              ? `Flat ${formatINR(coupon.value)} off${coupon.minSubtotal > 0 ? " on first purchase" : ""}`
                              : buyGet
                                ? `Buy ${buyGet.buy} Get ${buyGet.get} Free on all 50ml EDPs`
                                : coupon.description;

                        return (
                          <div
                            key={coupon.id}
                            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 ${
                              !isEligible ? "opacity-60" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold uppercase tracking-[0.02em]">
                                {coupon.code}
                              </p>
                              <p className="mt-0.5 text-xs leading-snug text-black/55">
                                {offerText}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyToggleCoupon(coupon)}
                              className="inline-flex h-8 min-w-[70px] items-center justify-center border border-black/75 bg-transparent px-3 text-[11px] font-semibold tracking-[0.1em] text-black transition hover:bg-black hover:text-white"
                            >
                              {isEligible ? "Apply" : "View"}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </section>
            )}

            <section className="mt-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                Complete your ritual
              </p>
              <article className="grid grid-cols-[66px_minmax(0,1fr)_42px] items-center gap-3 border border-black/10 bg-white p-3">
                <div className="relative h-16 w-16 overflow-hidden bg-[#eee9e3]">
                  <Image
                    src={DISCOVERY_SET_IMAGES[0]}
                    alt="Discovery Set"
                    fill
                    sizes="66px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">Discovery Set</p>
                  <p className="mt-1 text-xs text-black/50">
                    Build 10 testers - {formatINR(DISCOVERY_SET_PRICE)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    showNavigationLoadingToast();
                    router.push(DISCOVERY_SET_PATH);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 transition hover:bg-black hover:text-white"
                  aria-label="Build Discovery Set"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </article>
            </section>
          </>
        )}
      </div>

      {items.length > 0 && (
        <footer className="shrink-0 border-t border-black/10 bg-[#fbfaf8] px-5 py-4">
          <div className="text-sm">
            <button
              type="button"
              onClick={() => setIsSummaryOpen((value) => !value)}
              className="flex w-full justify-between border-b border-black/10 pb-3 text-left"
            >
              <span className="font-semibold">Estimated Total</span>
              <span className="inline-flex items-center gap-2 font-semibold">
                {totalSavings > 0 ? (
                  <span className="text-sm font-medium text-black/35 line-through">
                    {formatINR(subtotal + regularShippingFee)}
                  </span>
                ) : null}
                {formatINR(grandTotal)}
                <ChevronDown
                  className={`h-4 w-4 text-black/35 transition ${isSummaryOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {isSummaryOpen && (
              <div className="space-y-2 border-b border-black/10 py-3">
                <div className="flex justify-between">
                  <span className="text-black/55">Subtotal</span>
                  <span className="font-semibold">{formatINR(subtotal)}</span>
                </div>
                {appliedCoupon && normalizedCouponDiscount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-black/55">
                      Offer ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold text-[#0f6b46]">
                      -{formatINR(normalizedCouponDiscount)}
                    </span>
                  </div>
                ) : null}
                {welcomeBackReward && welcomeBackLabel && welcomeBackDiscount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-black/55">
                      {welcomeBackLabel}
                    </span>
                    <span className="font-semibold text-[#0f6b46]">
                      -{formatINR(welcomeBackDiscount)}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-black/55">Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "font-semibold text-[#0f6b46]"
                        : "font-semibold"
                    }
                  >
                    {shippingFee === 0
                      ? `Free${shippingSavings > 0 ? ` (${formatINR(shippingSavings)} saved)` : ""}`
                      : formatINR(shippingFee)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleContinueCheckout}
            className="mt-4 h-12 w-full rounded-none bg-black text-sm font-semibold text-white hover:bg-black/85"
          >
            Checkout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </footer>
      )}
    </>
  );

  const renderSpecialUnlockOverlay = () => (
    <AnimatePresence>
      {rewardUnlockOpen && welcomeBackReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden px-5 ${
            isUrgentReward ? "bg-[#170506]" : "bg-[#07140d]"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 0.26, y: -80 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
            className={`absolute -left-24 top-8 h-[145%] w-28 rotate-[24deg] bg-gradient-to-r from-transparent blur-sm ${
              isUrgentReward ? "via-red-300" : "via-emerald-200"
            }`}
          />
          <motion.div
            initial={{ opacity: 0, y: -70 }}
            animate={{ opacity: 0.18, y: 70 }}
            transition={{ duration: 2.8, delay: 0.15, ease: "easeOut" }}
            className={`absolute -right-28 bottom-12 h-[145%] w-32 rotate-[24deg] bg-gradient-to-r from-transparent blur-sm ${
              isUrgentReward ? "via-orange-100" : "via-amber-100"
            }`}
          />

          <motion.div
            initial={{ scale: 0.86, opacity: 0, y: 28, rotateX: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: -10 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-[21rem] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] p-1 shadow-[0_35px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <motion.div
              initial={{ x: "-120%" }}
              animate={{ x: "130%" }}
              transition={{ duration: 1.25, delay: 0.55, ease: "easeInOut" }}
              className="absolute inset-y-0 z-20 w-24 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
            />
            <div
              className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 px-5 py-6 text-center ${
                isUrgentReward
                  ? "bg-[linear-gradient(145deg,rgba(31,6,7,0.97),rgba(76,12,14,0.96)_48%,rgba(18,4,5,0.98))]"
                  : "bg-[linear-gradient(145deg,rgba(8,20,13,0.96),rgba(17,33,24,0.96)_48%,rgba(5,12,9,0.98))]"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${
                  isUrgentReward ? "via-red-200/80" : "via-emerald-200/80"
                }`}
              />
              <div
                className={`absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent ${
                  isUrgentReward ? "via-orange-200/60" : "via-amber-200/60"
                }`}
              />

              <motion.div
                initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 ${
                  isUrgentReward
                    ? "text-red-100 shadow-[0_18px_38px_rgba(239,68,68,0.22)]"
                    : "text-emerald-100 shadow-[0_18px_38px_rgba(16,185,129,0.18)]"
                }`}
              >
                <Sparkles className="h-7 w-7" />
              </motion.div>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className={`mt-5 text-[11px] font-semibold uppercase ${
                  isUrgentReward ? "text-red-200" : "text-emerald-200"
                }`}
              >
                {welcomeBackLabel ?? welcomeBackReward.label} Unlocked
              </motion.p>

              <motion.div
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.55,
                  delay: 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-4"
              >
                <div className="flex items-end justify-center gap-1 text-white">
                  <span className="font-sans text-[6.8rem] font-semibold leading-[0.8]">
                    {effectiveWelcomeBackPercent || welcomeBackReward.percent}
                  </span>
                  <div className="pb-2 text-left">
                    <span className="block font-sans text-4xl font-semibold leading-none">
                      %
                    </span>
                    <span
                      className={`mt-1 block rounded-full border px-2 py-1 text-[11px] font-semibold uppercase ${
                        isUrgentReward
                          ? "border-red-200/45 bg-red-100/10 text-red-100"
                          : "border-amber-200/40 bg-amber-100/10 text-amber-100"
                      }`}
                    >
                      OFF
                    </span>
                  </div>
                </div>
                <p
                  className={`mt-4 font-sans text-3xl font-semibold leading-none ${
                    isUrgentReward ? "text-red-100" : "text-emerald-100"
                  }`}
                >
                  + Free Delivery
                </p>
              </motion.div>
            </div>
          </motion.div>

          {(isUrgentReward ? URGENT_REWARD_CONFETTI : REWARD_CONFETTI).map(
            (piece, index) => (
              <motion.span
                key={`${piece.left}-${piece.delay}-${index}`}
                initial={{ y: "-10vh", x: 0, opacity: 0, rotate: 0 }}
                animate={{
                  y: "112vh",
                  x: [0, piece.x, piece.x * -0.6],
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 140, 310],
                }}
                transition={{
                  duration: 2.2,
                  delay: piece.delay,
                  ease: "easeOut",
                }}
                className="absolute h-5 w-2 rounded-full shadow-sm"
                style={{
                  left: piece.left,
                  top: piece.top,
                  backgroundColor: piece.color,
                }}
              />
            ),
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 z-50 flex h-dvh max-h-dvh min-h-0 w-full max-w-[430px] flex-col border-l border-black/10 bg-[#fbfaf8] text-[#171717] shadow-[0_24px_90px_rgba(0,0,0,0.18)]"
          >
            {renderSidebarCartLayout()}
            {renderSpecialUnlockOverlay()}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
