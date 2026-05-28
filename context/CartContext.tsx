"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { FragranceSelection } from "@/lib/discovery-set";

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
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
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

  const emitTracking = (eventType: string, payload?: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: { eventType, payload },
      })
    );
  };

  // Hydrate cart from local storage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter((item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            typeof item.quantity === "number" &&
            (item.isGift || item.price >= 100)
          )
        );
      }
    } catch (error) {
      console.error("Failed to hydrate cart from storage:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

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
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setItems([]);

  // Keep gift eligibility consistent with spend tiers:
  // 1 gift above 1499, 2 gifts above 2099.
  useEffect(() => {
    if (!hydrated) return;
    setItems((prev) => {
      const paidSubtotal = prev.reduce(
        (sum, item) =>
          sum + (!item.isGift ? item.price * item.quantity : 0),
        0
      );
      const allowedGiftCount = paidSubtotal >= 2099 ? 2 : paidSubtotal >= 1499 ? 1 : 0;
      const paidItems = prev.filter((item) => !item.isGift);
      const nextGiftItems = Array.from({ length: allowedGiftCount }, (_, index) => ({
        id: `gift-tier-${index + 1}`,
        name: `Gift ${index + 1}`,
        inspiration: "Free gift",
        category: "Gift",
        image: GENERIC_GIFT_IMAGE,
        price: 0,
        size: "Gift",
        isGift: true,
        quantity: 1,
      }));
      const next = [...paidItems, ...nextGiftItems];

      if (
        prev.length === next.length &&
        prev.every((item, idx) => item.id === next[idx].id && item.quantity === next[idx].quantity)
      ) {
        return prev;
      }
      return next;
    });
  }, [items, hydrated]);

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
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
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
