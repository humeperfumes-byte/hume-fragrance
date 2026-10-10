export const SAFE_ERROR_CODES = ["ORDER_SAVE_FAILED", "PAID_ORDER_SAVE_FAILED", "DRAFT_SAVE_FAILED", "PAYMENT_VERIFY_FAILED", "PAYMENT_PROVIDER_FAILED", "CUSTOMER_LINK_FAILED", "CHECKOUT_RESUME_FAILED"] as const;
export type SafeErrorCode = typeof SAFE_ERROR_CODES[number];
export type SafeErrorEvent = { code: SafeErrorCode; reference: string; occurredAt: string };

// No error objects, URLs, customer fields or arbitrary metadata are accepted.
export function makeSafeErrorEvent(code: SafeErrorCode): SafeErrorEvent {
  if (!SAFE_ERROR_CODES.includes(code)) throw new Error("Unknown monitoring event");
  return { code, reference: crypto.randomUUID(), occurredAt: new Date().toISOString() };
}

export async function deliverSafeError(code: SafeErrorCode, enabled: boolean, sink: (event: SafeErrorEvent) => unknown | Promise<unknown>): Promise<void> {
  if (!enabled) return;
  try { await sink(makeSafeErrorEvent(code)); } catch { /* Monitoring cannot change checkout outcomes. */ }
}
