export type AdminControls = {
  behavioralIntelligenceEnabled: boolean;
  announcementEnabled: boolean;
  announcementText: string;
  heroOfferText: string;
  freeDeliveryThreshold: number;
  shippingChargeBelowThreshold: number;
  giftOneThreshold: number;
  giftTwoThreshold: number;
  welcomeBackEnabled: boolean;
  razorpayEnabled: boolean;
  whatsappCheckoutEnabled: boolean;
  whatsappNumber: string;
  defaultAdminWindowHours: number;
  enableTenTesterOption: boolean;
};

export const ADMIN_CONTROLS_KEY = "admin_controls";

export const defaultAdminControls: AdminControls = {
  behavioralIntelligenceEnabled: false,
  announcementEnabled: true,
  announcementText: "Free delivery over INR 500. Use HUME15 on your first order.",
  heroOfferText: "Free delivery over INR 500. Try HUME before designer prices.",
  freeDeliveryThreshold: 500,
  shippingChargeBelowThreshold: 100,
  giftOneThreshold: 1699,
  giftTwoThreshold: 2499,
  welcomeBackEnabled: true,
  razorpayEnabled: true,
  whatsappCheckoutEnabled: true,
  whatsappNumber: "919559024822",
  defaultAdminWindowHours: 24,
  enableTenTesterOption: true,
};

function numberOrDefault(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function stringOrDefault(value: unknown, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

export function normalizeAdminControls(value: unknown): AdminControls {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Partial<AdminControls>)
      : {};

  return {
    behavioralIntelligenceEnabled: raw.behavioralIntelligenceEnabled === true,
    announcementEnabled: raw.announcementEnabled !== false,
    announcementText: stringOrDefault(raw.announcementText, defaultAdminControls.announcementText),
    heroOfferText: stringOrDefault(raw.heroOfferText, defaultAdminControls.heroOfferText),
    freeDeliveryThreshold: numberOrDefault(raw.freeDeliveryThreshold, defaultAdminControls.freeDeliveryThreshold),
    shippingChargeBelowThreshold: numberOrDefault(
      raw.shippingChargeBelowThreshold,
      defaultAdminControls.shippingChargeBelowThreshold,
    ),
    giftOneThreshold: numberOrDefault(raw.giftOneThreshold, defaultAdminControls.giftOneThreshold),
    giftTwoThreshold: numberOrDefault(raw.giftTwoThreshold, defaultAdminControls.giftTwoThreshold),
    welcomeBackEnabled: raw.welcomeBackEnabled !== false,
    razorpayEnabled: raw.razorpayEnabled !== false,
    whatsappCheckoutEnabled: raw.whatsappCheckoutEnabled !== false,
    whatsappNumber: stringOrDefault(raw.whatsappNumber, defaultAdminControls.whatsappNumber).replace(/\D/g, ""),
    defaultAdminWindowHours: numberOrDefault(
      raw.defaultAdminWindowHours,
      defaultAdminControls.defaultAdminWindowHours,
    ),
    enableTenTesterOption: raw.enableTenTesterOption !== false,
  };
}
