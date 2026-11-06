"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { GrowthQuote } from "@/lib/growth/rules";
import { getStoredAccountLoginToken } from "@/lib/customer-account";
import type { FragranceSelection } from "@/lib/discovery-set";
import { useSiteControls } from "@/hooks/use-site-controls";
import { CHECKOUT_FEATURES } from "@/lib/checkout-settings";
import { subscribeCheckoutRewardChanges } from "@/lib/checkout-offers";

export interface CartItem {
  id: string;
  name: string;
  inspiration: string;
  category: string;
  image: string;
  price: number;
  size?: string;
  isGift?: boolean;
  kitSelections?: Array<{
    id: string;
    name: string;
    inspiration?: string;
  }>;
  sampleSelections?: FragranceSelection[];
  quantity: number;
}

interface CartContextType {
  coinsToUse: number;
  setCoinsToUse: (n: number) => void;
  coinReservationId: string;
  growthQuote: GrowthQuote | null;
  growthQuotePending: boolean;
  growthQuoteError: string;
  refreshGrowthQuote: () => void;
  hydrated: boolean;
  appliedCouponCode: string | null;
  setAppliedCouponCode: (code: string | null) => void;
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  restoreItems: (items: CartItem[]) => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "hume_cart_v2";
const GENERIC_GIFT_IMAGE = "/images/logo.png";
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );
  const settings = useSiteControls();
  const pathname = usePathname();
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [coinReservationId, setCoinReservationId] = useState("");
  const [growthQuote, setGrowthQuote] = useState<GrowthQuote | null>(null);
  const [growthQuotePending, setGrowthQuotePending] = useState(false);
  const [growthQuoteError, setGrowthQuoteError] = useState("");
  const [quoteRetry, setQuoteRetry] = useState(0);
  const revision = useRef(0);
  const refreshGrowthQuote = () => setQuoteRetry((n) => n + 1);
  useEffect(() => subscribeCheckoutRewardChanges(window, () => setQuoteRetry(n => n + 1)), []);
  useEffect(() => {
    const id =
      sessionStorage.getItem("hume_coin_reservation") || crypto.randomUUID();
    sessionStorage.setItem("hume_coin_reservation", id);
    setCoinReservationId(id);
    const selected = Number(sessionStorage.getItem("hume_coins_selected") || 0);
    if (CHECKOUT_FEATURES.coinRedemption && Number.isInteger(selected) && selected >= 0) setCoinsToUse(selected);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("hume_coins_selected", String(coinsToUse));
  }, [coinsToUse]);
  useEffect(() => {
    if (
      !hydrated ||
      !coinReservationId ||
      !items.some((item) => !item.isGift) ||
      (!isCartOpen && !pathname.includes("/checkout"))
    )
      return;
    const controller = new AbortController();
    setGrowthQuotePending(true);
    setGrowthQuoteError("");
    setGrowthQuote(null);
    const timeout = setTimeout(async () => {
      try {
        let percent = 0;
        try {
          const reward = JSON.parse(
            localStorage.getItem("hume_welcome_back_reward_v1") || "null",
          );
          if (reward?.expiresAt > Date.now()) percent = reward.percent;
        } catch {}
        revision.current = Math.max(Date.now(), revision.current + 1);
        const response = await fetch("/api/growth/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hume-account-token": getStoredAccountLoginToken(localStorage),
          },
          signal: controller.signal,
          body: JSON.stringify({
            items,
            couponCode: appliedCouponCode || undefined,
            coins: CHECKOUT_FEATURES.coinRedemption ? coinsToUse : 0,
            reservationId: coinReservationId,
            welcomePercent: percent,
            revision: revision.current,
          }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Could not refresh your total");
        if (!controller.signal.aborted) {
          setGrowthQuote(data);
          if (data.coins !== coinsToUse) setCoinsToUse(data.coins);
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setGrowthQuoteError((e as Error).message);
      } finally {
        if (!controller.signal.aborted) setGrowthQuotePending(false);
      }
    }, 350);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [
    items,
    appliedCouponCode,
    coinsToUse,
    coinReservationId,
    hydrated,
    isCartOpen,
    pathname,
    quoteRetry,
  ]);
  useEffect(() => {
    const offer = new URLSearchParams(location.search).get("offer");
    if (offer && /^[A-Za-z0-9_-]{3,32}$/.test(offer))
      setAppliedCouponCode(offer.toUpperCase());
  }, [pathname]);

  useEffect(() => {
    if (!isCartOpen && !pathname.includes("/checkout")) return;
    const timer = setInterval(refreshGrowthQuote, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [isCartOpen, pathname]);

  const emitTracking = (
    eventType: string,
    payload?: Record<string, unknown>,
  ) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: { eventType, payload },
      }),
    );
  };

  // Hydrate cart from local storage
  useEffect(() => {
    try {
      setAppliedCouponCode(
        new URLSearchParams(location.search)
          .get("offer")
          ?.trim()
          .toUpperCase() ||
          window.localStorage
            .getItem("hume_applied_coupon_code")
            ?.trim()
            .toUpperCase() ||
          null,
      );
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.name === "string" &&
              typeof item.price === "number" &&
              typeof item.quantity === "number" &&
              (item.isGift || item.price >= 100),
          ),
        );
      }
    } catch (error) {
      console.error("Failed to hydrate cart from storage:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (appliedCouponCode)
      window.localStorage.setItem(
        "hume_applied_coupon_code",
        appliedCouponCode,
      );
    else window.localStorage.removeItem("hume_applied_coupon_code");
  }, [hydrated, appliedCouponCode]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      emitTracking("add_to_cart", {
        productId: item.id,
        productName: item.name,
        price: item.price,
        isGift: Boolean(item.isGift),
      });
      if (existing) {
        if (item.isGift) return prev;
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    emitTracking("remove_from_cart", { productId: id });
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    emitTracking("update_cart_quantity", { productId: id, quantity });
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    const token = getStoredAccountLoginToken(localStorage);
    if (token && coinReservationId)
      void fetch("/api/growth/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hume-account-token": token,
        },
        body: JSON.stringify({ releaseReservation: coinReservationId }),
      });
    setItems([]);
    setCoinsToUse(0);
    setGrowthQuote(null);
    const id = crypto.randomUUID();
    setCoinReservationId(id);
    sessionStorage.setItem("hume_coin_reservation", id);
  };
  const restoreItems = (nextItems: CartItem[]) => {
    const restored = nextItems.map((item) => ({ ...item }));
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(restored));
    setItems(restored);
  };

  // Keep gift eligibility consistent with spend tiers:
  // 1 gift above the first threshold, 2 gifts above the second threshold.
  useEffect(() => {
    if (!hydrated) return;
    setItems((prev) => {
      const paidSubtotal = prev.reduce(
        (sum, item) => sum + (!item.isGift ? item.price * item.quantity : 0),
        0,
      );
      const allowedGiftCount =
        paidSubtotal >= settings.giftTwoThreshold
          ? 2
          : paidSubtotal >= settings.giftOneThreshold
            ? 1
            : 0;
      const paidItems = prev.filter((item) => !item.isGift);
      const nextGiftItems = Array.from(
        { length: allowedGiftCount },
        (_, index) => ({
          id: `gift-tier-${index + 1}`,
          name: `Gift ${index + 1}`,
          inspiration: "Free gift",
          category: "Gift",
          image: GENERIC_GIFT_IMAGE,
          price: 0,
          size: "Gift",
          isGift: true,
          quantity: 1,
        }),
      );
      const next = [...paidItems, ...nextGiftItems];

      if (
        prev.length === next.length &&
        prev.every(
          (item, idx) =>
            item.id === next[idx].id && item.quantity === next[idx].quantity,
        )
      ) {
        return prev;
      }
      return next;
    });
  }, [items, hydrated, settings.giftOneThreshold, settings.giftTwoThreshold]);

  // Persist cart to local storage
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to persist cart to storage:", error);
    }
  }, [items, hydrated]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        coinsToUse,
        setCoinsToUse,
        coinReservationId,
        growthQuote,
        growthQuotePending,
        growthQuoteError,
        refreshGrowthQuote,
        hydrated,
        appliedCouponCode,
        setAppliedCouponCode,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        restoreItems,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
