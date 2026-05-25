export type SavedPricingBreakdown = {
  subtotal: number;
  regularShippingFee?: number;
  shippingFee: number;
  couponCode?: string | null;
  couponLabel?: string | null;
  couponDiscount: number;
  welcomeBackCode?: string | null;
  welcomeBackLabel?: string | null;
  welcomeBackPercent?: number | null;
  welcomeBackDiscount: number;
  shippingSavings: number;
  grandTotal: number;
  totalSavings?: number;
  appliedOfferCodes?: string | null;
};

function toFiniteNumber(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toOptionalString(value: unknown): string | null {
  const text = String(value ?? "").trim();
  return text || null;
}

export function normalizeSavedPricingBreakdown(value: unknown): SavedPricingBreakdown | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  const subtotal = toFiniteNumber(raw.subtotal);
  const shippingFee = toFiniteNumber(raw.shippingFee);
  const couponDiscount = toFiniteNumber(raw.couponDiscount);
  const welcomeBackDiscount = toFiniteNumber(raw.welcomeBackDiscount);
  const shippingSavings = toFiniteNumber(raw.shippingSavings);
  const grandTotal = toFiniteNumber(raw.grandTotal);

  if (
    subtotal <= 0 &&
    shippingFee <= 0 &&
    couponDiscount <= 0 &&
    welcomeBackDiscount <= 0 &&
    grandTotal <= 0
  ) {
    return null;
  }

  return {
    subtotal,
    regularShippingFee: toFiniteNumber(raw.regularShippingFee),
    shippingFee,
    couponCode: toOptionalString(raw.couponCode),
    couponLabel: toOptionalString(raw.couponLabel),
    couponDiscount,
    welcomeBackCode: toOptionalString(raw.welcomeBackCode),
    welcomeBackLabel: toOptionalString(raw.welcomeBackLabel),
    welcomeBackPercent: toFiniteNumber(raw.welcomeBackPercent) || null,
    welcomeBackDiscount,
    shippingSavings,
    grandTotal,
    totalSavings: toFiniteNumber(raw.totalSavings),
    appliedOfferCodes: toOptionalString(raw.appliedOfferCodes),
  };
}

export function getSavedPricingOfferSummary(breakdown: SavedPricingBreakdown | null) {
  if (!breakdown) return null;

  const parts = [
    breakdown.couponCode && breakdown.couponDiscount > 0
      ? `${breakdown.couponCode} - ${breakdown.couponDiscount}`
      : null,
    breakdown.welcomeBackLabel && breakdown.welcomeBackDiscount > 0
      ? `${breakdown.welcomeBackLabel} - ${breakdown.welcomeBackDiscount}`
      : null,
    breakdown.shippingSavings > 0 ? `Free delivery - ${breakdown.shippingSavings}` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" / ") : null;
}
