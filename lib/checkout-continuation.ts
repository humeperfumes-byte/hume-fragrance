import type { CartItem } from "@/context/CartContext";

export type ActiveCheckout = {
  path: string;
  sessionId: string;
  status: "draft" | "payment_pending";
  grandTotal: number;
  items: Pick<CartItem, "id" | "name" | "image" | "size" | "price" | "quantity">[];
};

export function checkoutCanContinue(order: { status: string; checkoutChannel: string; paymentCapturedAt: unknown } | null) {
  return !order || (order.checkoutChannel === "razorpay" && !order.paymentCapturedAt &&
    !["cancelled", "refunded", "partially_refunded", "disputed", "delivered", "complete"].includes(order.status));
}

export function checkoutDraftAlert(previous: { phone: string | null; email: string | null } | null, details: { phone: string; email: string }): "initiated" | "contact_added" | null {
  if (!previous) return "initiated";
  return !hasCheckoutContact(previous) && hasCheckoutContact(details) ? "contact_added" : null;
}

export function hasCheckoutContact(details: { phone: string | null; email: string | null }) {
  const digits = (details.phone || "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "").replace(/^0(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email || "");
}

export const CHECKOUT_CONTINUATION_EVENT = "hume:checkout-continuation-updated";
