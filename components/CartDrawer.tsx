"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, MessageCircle, Trash2, Gift, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { stripRegionPrefix } from "@/lib/region-routing";

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
}

const CartDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  const freeDeliveryThreshold = 800;
  const deliveryChargeBelowThreshold = 100;
  const firstGiftThreshold = 799;
  const secondGiftThreshold = 1399;

  const [isBreakupOpen, setIsBreakupOpen] = useState(false);
  const [visibleCoupons, setVisibleCoupons] = useState<Coupon[]>([]);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const offersPanelRef = useRef<HTMLDivElement | null>(null);
  const { prefix: currentPrefix } = stripRegionPrefix(pathname || "/");
  const isIndiaRootStorefront = currentPrefix === "";
  const listableCoupons = isIndiaRootStorefront ? visibleCoupons : [];

  const subtotal = totalPrice;
  const paidItemCount = items.reduce((sum, item) => sum + (item.isGift ? 0 : item.quantity), 0);
  const shippingFee = subtotal > 0 && subtotal < freeDeliveryThreshold ? deliveryChargeBelowThreshold : 0;

  const appliedCoupon = useMemo(
    () => allCoupons.find((coupon) => coupon.code.toUpperCase() === (appliedCouponCode ?? "").toUpperCase()) ?? null,
    [allCoupons, appliedCouponCode]
  );

  const parseBuyGetConfig = (coupon: Coupon | null) => {
    if (!coupon) return null;

    const parseFromText = (text: string) => {
      const normalized = text.replace(/\s+/g, "");
      const match = normalized.match(/B(\d+)G(\d+)/i);
      if (!match) return null;
      const buy = Number(match[1]);
      const get = Number(match[2]);
      if (!Number.isFinite(buy) || !Number.isFinite(get) || buy <= 0 || get <= 0) return null;
      return { buy, get };
    };

    const fromType = parseFromText(coupon.type);
    if (fromType) return fromType;

    const fromCode = parseFromText(coupon.code);
    if (fromCode) return fromCode;

    return parseFromText(coupon.description);
  };

  const buyGetConfig = useMemo(() => parseBuyGetConfig(appliedCoupon), [appliedCoupon]);

  const eligiblePaidUnitsForBuyGet = buyGetConfig ? buyGetConfig.buy + buyGetConfig.get : 0;
  const buyGetEligible =
    !!appliedCoupon &&
    !!buyGetConfig &&
    subtotal >= appliedCoupon.minSubtotal &&
    paidItemCount >= eligiblePaidUnitsForBuyGet;

  const freeUnitTargetCount = buyGetConfig && buyGetEligible
    ? Math.floor(paidItemCount / (buyGetConfig.buy + buyGetConfig.get)) * buyGetConfig.get
    : 0;

  const freeUnitByItemId = useMemo(() => {
    if (!buyGetEligible || freeUnitTargetCount <= 0) return new Map<string, number>();

    const sortedUnits = items
      .filter((item) => !item.isGift)
      .flatMap((item) =>
        Array.from({ length: item.quantity }, (_, index) => ({
          itemId: item.id,
          unitKey: `${item.id}-${index}`,
          price: item.price,
        }))
      )
      .sort((a, b) => a.price - b.price);

    const freeUnits = sortedUnits.slice(0, freeUnitTargetCount);
    return freeUnits.reduce((acc, unit) => {
      acc.set(unit.itemId, (acc.get(unit.itemId) ?? 0) + 1);
      return acc;
    }, new Map<string, number>());
  }, [buyGetEligible, freeUnitTargetCount, items]);

  const buyGetDiscount = useMemo(() => {
    if (!buyGetEligible || freeUnitTargetCount <= 0) return 0;
    return items
      .filter((item) => !item.isGift)
      .reduce((sum, item) => {
        const freeCount = freeUnitByItemId.get(item.id) ?? 0;
        return sum + freeCount * item.price;
      }, 0);
  }, [buyGetEligible, freeUnitTargetCount, freeUnitByItemId, items]);

  const couponDiscount =
    appliedCoupon && subtotal >= appliedCoupon.minSubtotal
      ? appliedCoupon.type === "percent"
        ? (subtotal * appliedCoupon.value) / 100
        : appliedCoupon.type === "fixed"
          ? appliedCoupon.value
          : buyGetDiscount
      : 0;

  const normalizedCouponDiscount = Math.min(subtotal, couponDiscount);
  const grandTotal = subtotal - normalizedCouponDiscount + shippingFee;
  const mrpTotal = subtotal + shippingFee;
  const discountOnMrp = Math.max(0, mrpTotal - grandTotal);

  const unlockedGiftCount = subtotal >= secondGiftThreshold ? 2 : subtotal >= firstGiftThreshold ? 1 : 0;
  const claimedGiftCount = items.filter((item) => item.isGift).length;
  const amountToFirstGift = Math.max(0, firstGiftThreshold - subtotal);
  const amountToSecondGift = Math.max(0, secondGiftThreshold - subtotal);
  const giftProgress = Math.min(100, (subtotal / secondGiftThreshold) * 100);

  const progressMessage =
    subtotal < firstGiftThreshold
      ? `Add ${formatINR(amountToFirstGift)} more for Gift 1`
      : subtotal < secondGiftThreshold
        ? `Add ${formatINR(amountToSecondGift)} more for Gift 2`
        : "Gift 1 and Gift 2 unlocked";

  const isCouponEligible = (coupon: Coupon) => {
    if (subtotal < coupon.minSubtotal) return false;
    const buyGet = parseBuyGetConfig(coupon);
    if (buyGet && paidItemCount < buyGet.buy + buyGet.get) return false;
    return true;
  };

  useEffect(() => {
    let active = true;
    const loadCoupons = async () => {
      try {
        const [visibleResponse, allResponse] = await Promise.all([
          fetch("/api/coupons"),
          fetch("/api/coupons?includeHidden=1"),
        ]);
        if (!visibleResponse.ok || !allResponse.ok) throw new Error("Failed to fetch coupons");

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
    if (!appliedCouponCode) return;
    if (!appliedCoupon) {
      setAppliedCouponCode(null);
      return;
    }
    if (subtotal < appliedCoupon.minSubtotal || !isCouponEligible(appliedCoupon)) {
      setAppliedCouponCode(null);
    }
  }, [appliedCoupon, appliedCouponCode, subtotal, paidItemCount]);

  const handleApplyToggleCoupon = (coupon: Coupon) => {
    if (appliedCouponCode === coupon.code) {
      setAppliedCouponCode(null);
      toast({ title: "Coupon removed", description: `${coupon.code} has been removed.` });
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
    toast({ title: "Coupon applied", description: `${coupon.code} has been applied.` });
  };

  const handleApplyCouponFromInput = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast({ title: "Enter a coupon code", description: "Type a valid coupon code to apply." });
      return;
    }

    const coupon = allCoupons.find((c) => c.code.toUpperCase() === code);
    if (!coupon) {
      toast({ title: "Invalid coupon", description: "This coupon code is not available right now." });
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
    toast({ title: "Coupon applied", description: `${coupon.code} has been applied.` });
  };

  const handleToggleOffers = () => {
    setIsOffersOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            offersPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 80);
        });
      }
      return next;
    });
  };

  const generateOrderMessage = () => {
    const orderLines = items
      .map(
        (item) =>
          `* ${item.name}${item.isGift ? " [FREE GIFT]" : ""} (${item.size ?? "50ml"}, Inspired by ${item.inspiration}) x${item.quantity} - ${formatINR(item.price * item.quantity)}`
      )
      .join("\n");

    const couponLine =
      appliedCoupon && normalizedCouponDiscount > 0
        ? `\nCoupon (${appliedCoupon.code}): -${formatINR(normalizedCouponDiscount)}`
        : "";

    return `Hello HUME Perfumes\n\nI would like to place an order:\n\n${orderLines}\n\nSubtotal: ${formatINR(subtotal)}${couponLine}\nDelivery: ${shippingFee === 0 ? "FREE" : formatINR(shippingFee)}\nGrand Total: ${formatINR(grandTotal)}\nAuto Gifts: ${claimedGiftCount}/${unlockedGiftCount} added based on subtotal tiers (${formatINR(firstGiftThreshold)} and ${formatINR(secondGiftThreshold)}).\n\nPlease let me know how to proceed with the payment.`;
  };

  const handleWhatsAppCheckout = () => {
    const message = encodeURIComponent(generateOrderMessage());
    window.open(`https://wa.me/919559024822?text=${message}`, "_blank");
    toast({ title: "Opening WhatsApp", description: "Complete your order via WhatsApp." });
  };

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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="font-sans text-xl font-semibold">Your Bag</h2>
                <span className="text-sm text-[#8fa1b6]">({totalItems} items)</span>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-muted transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-none px-5 py-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-medium mb-2">Your bag is empty</p>
                  <p className="text-sm text-muted-foreground">Discover our collection of fragrances</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="mb-8 pb-4 border-b border-border/70">
                    <div className="flex items-center justify-between mb-3 text-sm font-medium">
                      <span>{progressMessage}</span>
                      <span className="text-[#8fa1b6] text-[12px]">{claimedGiftCount}/{unlockedGiftCount} Unlocked</span>
                    </div>
                    <div className="relative pt-6">
                      <div className="absolute inset-x-0 top-0 text-[10px] font-medium text-[#8fa1b6]">
                        <span className="absolute left-0">{formatINR(0)}</span>
                        <span
                          className="absolute -translate-x-1/2"
                          style={{ left: `${(firstGiftThreshold / secondGiftThreshold) * 100}%` }}
                        >
                          {formatINR(firstGiftThreshold)}
                        </span>
                        <span className="absolute right-0">{formatINR(secondGiftThreshold)}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full bg-[#e8edf4] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${giftProgress}%` }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="h-full bg-[#20c45a]"
                        />
                      </div>
                      <div className="relative mt-[-11px] h-0">
                        {[(firstGiftThreshold / secondGiftThreshold) * 100, 100].map((left, idx) => (
                          <span
                            key={`gift-marker-${idx}`}
                            className="absolute -translate-x-1/2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#20c45a] bg-white shadow-sm"
                            style={{ left: `${left}%` }}
                          >
                            <Gift className="h-3 w-3 text-[#20c45a]" />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {items.map((item) => {
                    const freeUnitsFromCoupon = freeUnitByItemId.get(item.id) ?? 0;
                    const isCouponFree = freeUnitsFromCoupon > 0 && !item.isGift;
                    const paidUnits = Math.max(0, item.quantity - freeUnitsFromCoupon);
                    const lineTotal = paidUnits * item.price;
                    const isLineFullyFree = item.isGift || (isCouponFree && paidUnits === 0);
                    const isAnyFreeItem = item.isGift || isCouponFree;
                    return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      className={`flex gap-3 pb-4 border-b border-border/40 ${
                        isAnyFreeItem
                          ? "cursor-pointer rounded-lg bg-emerald-50/70 p-2 border border-emerald-200"
                          : ""
                      }`}
                      onClick={() => {
                        if (!item.isGift) return;
                        router.push(`/accessory/${item.id.replace(/^gift-/, "")}`);
                      }}
                    >
                      <img
                        src={withCloudinaryTransforms(item.image || "/images/logo.png?v=2", { width: 160 })}
                        alt={item.name}
                        className="w-20 h-20 rounded-md object-cover bg-secondary"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/logo.png?v=2";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                          <h3 className="font-sans text-[14px] font-medium leading-tight min-w-0">{item.name}</h3>
                          <p className="text-[14px] font-semibold leading-none whitespace-nowrap pl-2">
                            {isLineFullyFree
                              ? <span className="text-emerald-600">FREE</span>
                              : formatINR(lineTotal > 0 ? lineTotal : item.price)}
                          </p>
                        </div>
                        <p className="max-w-full  pt-1 pr-2 text-[12px] italic text-[#8fa1b6] leading-snug break-words">
                          Inspired by {item.inspiration}
                        </p>
                        {isCouponFree && (
                          <p className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            {freeUnitsFromCoupon} free via {appliedCoupon?.code}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          {item.isGift ? (
                            <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-[#20c45a]">Free Gift Item</span>
                          ) : (
                            <div className="inline-flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item.id, item.quantity - 1);
                                }}
                                className="h-7 w-7 rounded-xl flex items-center justify-center border border-border bg-white"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="h-7 w-7 flex items-center justify-center border-y border-border bg-white text-[14px] font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateQuantity(item.id, item.quantity + 1);
                                }}
                                className="h-7 w-7 rounded-xl flex items-center justify-center border border-border bg-white"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="ml-auto w-8 h-8 flex items-center justify-center rounded-2xl  bg-red-50 text-red-500 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )})}

                  {(allCoupons.length > 0 || appliedCoupon) && (
                    <div className="relative border border-border rounded-2xl bg-secondary/10 p-3">
                      <div className="rounded-xl bg-muted/50 p-2.5">
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                                {appliedCoupon.code}
                              </p>
                              {normalizedCouponDiscount > 0 ? (
                                <p className="mt-1 text-xs text-emerald-700">
                                  You save {formatINR(normalizedCouponDiscount)}
                                </p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => setAppliedCouponCode(null)}
                              className="h-8 rounded-full px-3 text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-[#0b5ca8]/50"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCouponFromInput}
                              className="h-9 rounded-full px-4 text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-60"
                              disabled={!couponInput.trim()}
                            >
                              Apply
                            </button>
                          </div>
                        )}
                      </div>

                      {listableCoupons.length > 0 ? (
                        <button
                          type="button"
                          onClick={handleToggleOffers}
                          className="mt-3 w-full rounded-full border border-[#0b5ca8]/30 bg-[#0b5ca8]/5 px-4 py-2 text-center text-sm font-semibold text-[#0b5ca8] hover:bg-[#0b5ca8]/10"
                        >
                          View All Offers {isOffersOpen ? "▴" : "▾"}
                        </button>
                      ) : null}

                      {isOffersOpen && listableCoupons.length > 0 && (
                        <div ref={offersPanelRef} className="mt-3 rounded-xl border border-border bg-background p-3 space-y-3">
                          <p className="font-semibold text-base">Available Offers</p>
                          {listableCoupons.map((coupon) => {
                            const isApplied = appliedCouponCode === coupon.code;
                            const isEligible = isCouponEligible(coupon);
                            return (
                              <div key={coupon.id} className="rounded-lg border border-border p-3">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-lg">{coupon.code}</p>
                                  <button
                                    type="button"
                                    onClick={() => handleApplyToggleCoupon(coupon)}
                                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                                      isApplied
                                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                                        : isEligible
                                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                        : "bg-muted text-foreground/70 hover:bg-muted/80"
                                    }`}
                                  >
                                    {isApplied ? "Remove" : "Apply"}
                                  </button>
                                </div>
                                <p className="mt-1 text-emerald-700 text-xs">
                                  {coupon.type === "percent"
                                    ? `You save ${coupon.value}%`
                                    : coupon.type === "fixed"
                                      ? `You save ${formatINR(coupon.value)}`
                                      : (() => {
                                          const buyGet = parseBuyGetConfig(coupon);
                                          return buyGet
                                            ? `Buy ${buyGet.buy} Get ${buyGet.get} Free`
                                            : `Offer discount ${formatINR(coupon.value)}`;
                                        })()}
                                </p>
                                <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                {!isEligible && !isApplied ? (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {(() => {
                                      const buyGet = parseBuyGetConfig(coupon);
                                      if (buyGet && paidItemCount < buyGet.buy + buyGet.get) {
                                        const requiredItems = buyGet.buy + buyGet.get;
                                        return `Min items: ${requiredItems} (add ${requiredItems - paidItemCount} more)`;
                                      }
                                      return `Min order: ${formatINR(coupon.minSubtotal)}`;
                                    })()}
                                  </p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 space-y-3">
                <button type="button" onClick={() => setIsBreakupOpen((v) => !v)} className="w-full flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-[13px] font-medium">
                    <Image src="/images/ruppee.png" alt="currency icon" width={16} height={16} />
                    Estimated Total
                    {isBreakupOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                  </span>
                  <span className="text-[18px] leading-none font-semibold">{formatINR(grandTotal)}</span>
                </button>

                {isBreakupOpen && (
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-2 text-[14px]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Order Summary</span>
                      <span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                        {formatINR(discountOnMrp)} saved so far
                      </span>
                    </div>
                    <div className="flex justify-between"><span className="text-muted-foreground">MRP total</span><span>{formatINR(mrpTotal)}</span></div>
                    {appliedCoupon && normalizedCouponDiscount > 0 ? (
                      <div className="flex justify-between"><span className="text-muted-foreground">Coupon ({appliedCoupon.code})</span><span className="text-emerald-600">-{formatINR(normalizedCouponDiscount)}</span></div>
                    ) : null}
                    <div className="flex justify-between"><span className="text-muted-foreground">Cart Subtotal</span><span>{formatINR(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Shipping Charges</span><span className={shippingFee === 0 ? "text-emerald-600" : ""}>{shippingFee === 0 ? "FREE" : formatINR(shippingFee)}</span></div>
                    {shippingFee > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Shop more than {formatINR(freeDeliveryThreshold)} for FREE Delivery.
                      </p>
                    ) : null}
                    <div className="flex justify-between pt-2 border-t border-border text-base font-semibold">
                      <span>Estimated Total</span>
                      <span>{formatINR(grandTotal)}</span>
                    </div>
                  </div>
                )}

                <Button onClick={handleWhatsAppCheckout} className="h-11 w-full rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white text-[14px] font-semibold">
                  <MessageCircle size={18} className="mr-2" />
                  Order via WhatsApp
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
