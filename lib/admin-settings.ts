import {
  DISCOVERY_SET_ORIGINAL_PRICE,
  DISCOVERY_SET_PATH,
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SIZE,
} from "@/lib/discovery-set";
import { formatINR } from "@/lib/currency";

export type AdminControls = {
  behavioralIntelligenceEnabled: boolean;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
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
};

export const ADMIN_CONTROLS_KEY = "admin_controls";

export const defaultAdminControls: AdminControls = {
  behavioralIntelligenceEnabled: false,
  announcementEnabled: true,
  announcementText: "Free delivery over INR 500. Use HUME15 on your first order.",
  announcementLink: "",
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
  const rawAnnouncementText = stringOrDefault(
    raw.announcementText,
    defaultAdminControls.announcementText,
  );
  const rawAnnouncementLink =
    typeof raw.announcementLink === "string"
      ? raw.announcementLink.trim()
      : defaultAdminControls.announcementLink;
  const isDiscoverySetAnnouncement =
    rawAnnouncementLink.toLowerCase().includes("/discovery-set") ||
    rawAnnouncementText.toLowerCase().includes("discovery set");

  return {
    behavioralIntelligenceEnabled: raw.behavioralIntelligenceEnabled === true,
    announcementEnabled: raw.announcementEnabled !== false,
    announcementText: isDiscoverySetAnnouncement
      ? `Pre-order the HUME Discovery Set: ${DISCOVERY_SET_SIZE} testers for ${formatINR(DISCOVERY_SET_PRICE)} (original ${formatINR(DISCOVERY_SET_ORIGINAL_PRICE)})`
      : rawAnnouncementText,
    announcementLink: isDiscoverySetAnnouncement
      ? DISCOVERY_SET_PATH
      : rawAnnouncementLink,
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
  };
}
