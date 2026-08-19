export const PAYMENT_RECOVERY_KEY = "hume_payment_recovery_v1";
export const PAYMENT_RECOVERY_MODE_KEY = "hume_payment_recovery_mode_v1";
export const PAYMENT_RECOVERY_EVENT = "hume:payment-recovery-updated";

export type RecoveryPaymentMode = "full" | "partial_cod";

export type PaymentRecovery = {
  orderId: string;
  orderNumber: string;
  grandTotal: number;
  createdAt: string;
  status: "payment_pending" | "payment_failed";
  items?: Array<{
    id: string;
    name: string;
    inspiration?: string;
    size?: string;
    image?: string;
    price: number;
    quantity: number;
    isGift?: boolean;
  }>;
};

export function readPaymentRecovery(storage: Storage): PaymentRecovery | null {
  try {
    const parsed = JSON.parse(storage.getItem(PAYMENT_RECOVERY_KEY) || "null") as PaymentRecovery | null;
    if (!parsed?.orderId || !parsed.orderNumber || !Number.isFinite(parsed.grandTotal)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePaymentRecovery(storage: Storage, recovery: PaymentRecovery) {
  storage.setItem(PAYMENT_RECOVERY_KEY, JSON.stringify(recovery));
  window.dispatchEvent(new Event(PAYMENT_RECOVERY_EVENT));
}

export function clearPaymentRecovery(storage: Storage) {
  storage.removeItem(PAYMENT_RECOVERY_KEY);
  storage.removeItem(PAYMENT_RECOVERY_MODE_KEY);
  window.dispatchEvent(new Event(PAYMENT_RECOVERY_EVENT));
}
