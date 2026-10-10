export const CHECKOUT_EVENTS = ["opened", "place_order_clicked", "validation_failed", "payment_prepared", "payment_window_opened", "payment_window_closed", "payment_failed", "verification_failed", "payment_start_failed", "payment_window_missing", "payment_callback_verified", "page_hidden", "navigation_requested", "reason_given", "payment_options_viewed", "full_selected", "partial_cod_selected"] as const;
export const EXIT_REASONS = { full_cod: "Wanted full COD", payment_problem: "Payment problem", delivery: "Delivery concern", price: "Price too high", browsing: "Just browsing", other: "Other" } as const;
export type CheckoutEvent = typeof CHECKOUT_EVENTS[number];
export type ExitReason = keyof typeof EXIT_REASONS;
export type CheckoutActivity = { event: CheckoutEvent; at: string; reason?: ExitReason };
export const ACTIVITY_LABELS: Record<CheckoutEvent, string> = {
  opened: "Checkout opened or resumed", place_order_clicked: "Place order tapped", validation_failed: "Details or stock validation did not pass",
  payment_prepared: "Payment request prepared", payment_window_opened: "Payment window opening requested", payment_window_closed: "Payment window closed",
  payment_failed: "Payment provider reported failure", verification_failed: "Payment verification did not complete", payment_start_failed: "Payment could not start",
  payment_window_missing: "Payment window did not appear", payment_callback_verified: "Payment callback verified",
  page_hidden: "Checkout tab hidden or page left", reason_given: "Customer supplied a reason", payment_options_viewed: "Payment choices shown",
  full_selected: "Full payment selected", partial_cod_selected: "20% advance COD selected",
  navigation_requested: "Navigation away from checkout requested",
};
export function readCheckoutActivity(value: unknown): CheckoutActivity[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is CheckoutActivity => !!item && typeof item === "object" && CHECKOUT_EVENTS.includes(item.event) && typeof item.at === "string" && Number.isFinite(Date.parse(item.at)) && (!item.reason || Object.hasOwn(EXIT_REASONS, item.reason))).slice(-80).map(({ event, at, reason }) => ({ event, at, ...(reason ? { reason } : {}) }));
}
export function appendCheckoutActivity(previous: unknown, next: CheckoutActivity) {
  const events = readCheckoutActivity(previous);
  const last = events.at(-1);
  if (last?.event === next.event && last.reason === next.reason && Date.parse(next.at) - Date.parse(last.at) < 5000) return events;
  return [...events, next].slice(-80);
}
