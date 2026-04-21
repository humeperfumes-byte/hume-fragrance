"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const CHECKOUT_STORAGE_KEY = "hume_checkout_details_v1";
const CHECKOUT_SESSION_KEY = "hume_checkout_session_id";
const FIRST_TOUCH_SOURCE_KEY = "hume_first_touch_source";
const APPLIED_COUPON_STORAGE_KEY = "hume_applied_coupon_code";
const FREE_DELIVERY_THRESHOLD = 800;
const DELIVERY_FEE_BELOW_THRESHOLD = 100;

type CheckoutDetails = {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

type FirstTouchSource = {
  source: string;
  category: string;
  referrerHost: string | null;
  capturedAt?: string;
};

const defaultDetails: CheckoutDetails = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

const checkoutFieldClassName =
  "h-12 rounded-2xl border-border/85 bg-secondary/20 px-4 text-[0.95rem] shadow-none transition-colors placeholder:text-sm placeholder:text-muted-foreground/65 focus-visible:border-foreground/25 focus-visible:bg-background focus-visible:ring-0";

const checkoutTextareaClassName =
  "min-h-28 rounded-2xl border-border/85 bg-secondary/20 px-4 py-3 text-[0.95rem] shadow-none transition-colors placeholder:text-sm placeholder:text-muted-foreground/65 focus-visible:border-foreground/25 focus-visible:bg-background focus-visible:ring-0";

function getOrCreateCheckoutSessionId() {
  const existing = window.localStorage.getItem(CHECKOUT_SESSION_KEY);
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CHECKOUT_SESSION_KEY, next);
  return next;
}

function getDraftStatus(details: CheckoutDetails) {
  const hasAnyValue = Object.values(details).some((value) => value.trim().length > 0);
  if (!hasAnyValue) return "started" as const;

  const requiredKeys: Array<keyof CheckoutDetails> = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ];

  const isComplete = requiredKeys.every((key) => details[key].trim().length > 0);
  return isComplete ? ("complete" as const) : ("partial" as const);
}

function getFirstTouchSource(): FirstTouchSource | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FIRST_TOUCH_SOURCE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirstTouchSource;
  } catch (error) {
    console.error("Failed to read first-touch source:", error);
    return null;
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { items, totalPrice } = useCart();
  const checkoutSessionIdRef = useRef<string | null>(null);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSignatureRef = useRef<string>("");
  const [details, setDetails] = useState<CheckoutDetails>(() => {
    if (typeof window === "undefined") return defaultDetails;
    try {
      const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!raw) return defaultDetails;
      const parsed = JSON.parse(raw) as Partial<CheckoutDetails>;
      return { ...defaultDetails, ...parsed };
    } catch (error) {
      console.error("Failed to hydrate checkout details:", error);
      return defaultDetails;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(details));
    } catch (error) {
      console.error("Failed to persist checkout details:", error);
    }
  }, [details]);

  const shippingFee =
    totalPrice > 0 && totalPrice < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE_BELOW_THRESHOLD : 0;
  const grandTotal = totalPrice + shippingFee;

  const giftItems = useMemo(() => items.filter((item) => item.isGift), [items]);
  const appliedCouponCode = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(APPLIED_COUPON_STORAGE_KEY)?.trim().toUpperCase() ?? null;
  }, []);

  const buildDraftPayload = useCallback(
    (
      lastEditedField?: keyof CheckoutDetails,
      statusOverride?: "started" | "partial" | "complete" | "whatsapp_initiated",
    ) => {
      const firstTouch = getFirstTouchSource();
      return {
      sessionId:
        checkoutSessionIdRef.current ??
        (typeof window !== "undefined" ? getOrCreateCheckoutSessionId() : "server"),
      status: statusOverride ?? getDraftStatus(details),
      path: pathname,
      lastEditedField,
      acquisitionSource: firstTouch?.source,
      acquisitionCategory: firstTouch?.category,
      acquisitionReferrerHost: firstTouch?.referrerHost ?? undefined,
      subtotal: totalPrice,
      shippingFee,
      grandTotal,
      cartSnapshot: items.map((item) => ({
        id: item.id,
        name: item.name,
        inspiration: item.inspiration,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        isGift: item.isGift,
      })),
      details,
      };
    },
    [details, grandTotal, items, pathname, shippingFee, totalPrice],
  );

  const persistDraft = useCallback(
    async (
      lastEditedField?: keyof CheckoutDetails,
      statusOverride?: "started" | "partial" | "complete" | "whatsapp_initiated",
      force = false,
    ) => {
      if (typeof window === "undefined") return;

      if (!checkoutSessionIdRef.current) {
        checkoutSessionIdRef.current = getOrCreateCheckoutSessionId();
      }

      const payload = buildDraftPayload(lastEditedField, statusOverride);
      const signature = JSON.stringify(payload);

      if (!force && signature === lastSavedSignatureRef.current) return;

      try {
        const response = await fetch("/api/checkout-drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          lastSavedSignatureRef.current = signature;
        }
      } catch (error) {
        console.error("Checkout draft save failed:", error);
      }
    },
    [buildDraftPayload],
  );

  const updateField = (field: keyof CheckoutDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field: keyof CheckoutDetails) => {
    void persistDraft(field, undefined, true);
  };

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    if (!checkoutSessionIdRef.current) {
      checkoutSessionIdRef.current = getOrCreateCheckoutSessionId();
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      void persistDraft();
    }, 700);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [details, items, persistDraft, totalPrice, shippingFee, grandTotal]);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    const flushDraft = () => {
      void persistDraft(undefined, undefined, true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDraft();
      }
    };

    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [items.length, persistDraft]);

  const validate = () => {
    const requiredFields: Array<{ key: keyof CheckoutDetails; label: string }> = [
      { key: "fullName", label: "Full name" },
      { key: "phone", label: "Phone number" },
      { key: "addressLine1", label: "Address line 1" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "pincode", label: "Pincode" },
    ];

    const missing = requiredFields.find(({ key }) => !details[key].trim());
    if (missing) {
      toast({
        title: `${missing.label} is required`,
        description: "Please complete all required order details before continuing.",
      });
      return false;
    }

    const phoneDigits = details.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast({
        title: "Enter a valid phone number",
        description: "A 10 digit mobile number works best for order confirmation.",
      });
      return false;
    }

    const pincodeDigits = details.pincode.replace(/\D/g, "");
    if (pincodeDigits.length < 6) {
      toast({
        title: "Enter a valid pincode",
        description: "Please add a valid delivery pincode.",
      });
      return false;
    }

    return true;
  };

  const buildOrderMessage = () => {
    const itemLines = items
      .map((item) => {
        const linePrice = item.isGift ? "FREE" : formatINR(item.price * item.quantity);
        return `* ${item.name}${item.isGift ? " [FREE GIFT]" : ""} (${item.size ?? "50ml"}, Inspired by ${item.inspiration}) x${item.quantity} - ${linePrice}`;
      })
      .join("\n");

    const addressBlock = [
      details.addressLine1.trim(),
      details.addressLine2.trim(),
      `${details.city.trim()}, ${details.state.trim()} ${details.pincode.trim()}`.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    return [
      "Hello HUME Fragrance",
      "",
      "I want to place this order:",
      "",
      itemLines,
      "",
      `Subtotal: ${formatINR(totalPrice)}`,
      `Delivery: ${shippingFee === 0 ? "FREE" : formatINR(shippingFee)}`,
      `Grand Total: ${formatINR(grandTotal)}`,
      appliedCouponCode ? `Coupon Code: ${appliedCouponCode}` : null,
      giftItems.length > 0 ? `Free Gifts: ${giftItems.map((item) => item.name).join(", ")}` : null,
      "",
      "Customer details:",
      `Name: ${details.fullName.trim()}`,
      `Phone: ${details.phone.trim()}`,
      details.email.trim() ? `Email: ${details.email.trim()}` : null,
      `Address: ${addressBlock}`,
      details.notes.trim() ? `Order notes: ${details.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleWhatsAppOrder = () => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add a product before placing an order.",
      });
      router.push("/shop");
      return;
    }

    if (!validate()) return;

    void persistDraft(undefined, "whatsapp_initiated", true);

    const encodedMessage = encodeURIComponent(buildOrderMessage());
    window.open(`https://wa.me/919559024822?text=${encodedMessage}`, "_blank");

    if (appliedCouponCode) {
      const sessionId = checkoutSessionIdRef.current ?? getOrCreateCheckoutSessionId();
      void fetch("/api/coupon-code-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId,
          channel: "whatsapp",
          eventType: "sent",
          couponCode: appliedCouponCode,
          destination: "919559024822",
          path: pathname,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          payload: {
            subtotal: totalPrice,
            shippingFee,
            grandTotal,
            itemCount: items.length,
          },
        }),
      }).catch((error) => {
        console.error("Failed to capture WhatsApp coupon event:", error);
      });
    }

    toast({
      title: "Opening WhatsApp",
      description: "Your order details have been prefilled for WhatsApp.",
    });
  };

  if (items.length === 0) {
    return (
      <section className="pt-28 pb-20">
        <div className="container-luxury">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card/95 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <p className="text-caption text-muted-foreground mb-3">Checkout</p>
            <h1 className="font-serif text-4xl mb-4">Your bag is empty</h1>
            <p className="text-body text-muted-foreground mb-6">
              Add a fragrance to continue with checkout.
            </p>
            <Button onClick={() => router.push("/shop")} className="h-11 px-6">
              Explore Fragrances
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-20">
      <div className="container-luxury">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="text-caption text-muted-foreground mb-3">Checkout</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Delivery Details</h1>
          <div className="mx-auto mb-6 h-px w-16 bg-border" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-border bg-card/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:p-7">
            <div className="mb-6 border-b border-border/70 pb-5">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Customer Details</p>
                <h2 className="mt-2 font-serif text-3xl">Where should we send it?</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Full Name</label>
                <Input
                  value={details.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  onBlur={() => handleFieldBlur("fullName")}
                  placeholder="Your full name"
                  className={checkoutFieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Phone Number</label>
                <Input
                  value={details.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  onBlur={() => handleFieldBlur("phone")}
                  placeholder="10 digit mobile number"
                  inputMode="tel"
                  className={checkoutFieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Email</label>
                <Input
                  value={details.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  onBlur={() => handleFieldBlur("email")}
                  placeholder="name@example.com"
                  inputMode="email"
                  className={checkoutFieldClassName}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Address Line 1</label>
                <Input
                  value={details.addressLine1}
                  onChange={(e) => updateField("addressLine1", e.target.value)}
                  onBlur={() => handleFieldBlur("addressLine1")}
                  placeholder="House number, street, area"
                  className={checkoutFieldClassName}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Address Line 2 (Optional)</label>
                <Input
                  value={details.addressLine2}
                  onChange={(e) => updateField("addressLine2", e.target.value)}
                  onBlur={() => handleFieldBlur("addressLine2")}
                  placeholder="Landmark, apartment, nearby place"
                  className={checkoutFieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">City</label>
                <Input
                  value={details.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  onBlur={() => handleFieldBlur("city")}
                  placeholder="City"
                  className={checkoutFieldClassName}
                />
              </div>
              <div>
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">State</label>
                <Input
                  value={details.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  onBlur={() => handleFieldBlur("state")}
                  placeholder="State"
                  className={checkoutFieldClassName}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Pincode</label>
                <Input
                  value={details.pincode}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  onBlur={() => handleFieldBlur("pincode")}
                  placeholder="6 digit pincode"
                  inputMode="numeric"
                  className={checkoutFieldClassName}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">Order Notes (Optional)</label>
                <Textarea
                  value={details.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  onBlur={() => handleFieldBlur("notes")}
                  placeholder="Preferred delivery time, landmark, gifting note, etc."
                  className={checkoutTextareaClassName}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={handleWhatsAppOrder} className="h-12 w-full rounded-full bg-[#25D366] px-5 text-white hover:bg-[#20bd5a]">
                ORDER
              </Button>
              <Button variant="outline" onClick={() => router.push("/shop")} className="h-12 w-full rounded-full">
                Continue Shopping
              </Button>
            </div>
          </div>

          <div className="h-fit rounded-[2rem] border border-border bg-card/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:sticky md:top-28 md:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border/70 pb-5">
              <div>
                <p className="text-caption text-muted-foreground mb-1">Order Summary</p>
                <h2 className="font-serif text-3xl">Your Bag</h2>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm text-muted-foreground">{items.length} items</span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 border-b border-border/60 pb-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={withCloudinaryTransforms(item.image || "/images/logo.png?v=2", { width: 160 })}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="mt-1 text-sm italic text-muted-foreground">Inspired by {item.inspiration}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Qty {item.quantity}</span>
                      <span className={item.isGift ? "font-semibold text-emerald-600" : "font-semibold"}>
                        {item.isGift ? "FREE" : formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-secondary/35 p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Billing Snapshot</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatINR(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className={shippingFee === 0 ? "text-emerald-600" : ""}>
                    {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Shop above {formatINR(FREE_DELIVERY_THRESHOLD)} for free delivery.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700">You have unlocked free delivery on this order.</p>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>WhatsApp Confirmation</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Estimated Total</span>
                <span>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Secure Checkout</p>
            <p className="mt-2 text-sm text-foreground">Review your full order before sending it on WhatsApp.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Fast Dispatch</p>
            <p className="mt-2 text-sm text-foreground">Ready stock orders are usually prepared within 24 hours.</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">Made By HUME</p>
            <p className="mt-2 text-sm text-foreground">Filled and packed in our own manufacturing facility.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
