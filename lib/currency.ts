import type { DisplayCurrency } from "@/lib/region-routing";
import { getRegionConfigFromPrefix, stripRegionPrefix } from "@/lib/region-routing";

const INR_TO_USD_RATE = 83; // fallback display rates
const INR_TO_CAD_RATE = 61;
const INR_TO_EUR_RATE = 90;
const INR_TO_AUD_RATE = 55;
const INR_TO_SAR_RATE = 22;
const INR_TO_AED_RATE = 23;
const INTERNATIONAL_PRICE_MULTIPLIER = 2;

function detectDisplayCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "INR";

  // URL prefix is authoritative: /us, /ca, /au, /eu, /ae, /sa.
  const { prefix } = stripRegionPrefix(window.location.pathname || "/");
  if (prefix !== "") {
    return getRegionConfigFromPrefix(prefix).currency;
  }

  // Root (no prefix) is always India storefront.
  return "INR";
}

function formatAs(amount: number, currency: DisplayCurrency) {
  if (currency !== "INR") {
    const rates: Record<Exclude<DisplayCurrency, "INR">, number> = {
      USD: INR_TO_USD_RATE,
      CAD: INR_TO_CAD_RATE,
      EUR: INR_TO_EUR_RATE,
      AUD: INR_TO_AUD_RATE,
      SAR: INR_TO_SAR_RATE,
      AED: INR_TO_AED_RATE,
    };
    const locales: Record<Exclude<DisplayCurrency, "INR">, string> = {
      USD: "en-US",
      CAD: "en-CA",
      EUR: "en-FI",
      AUD: "en-AU",
      SAR: "ar-SA",
      AED: "ar-AE",
    };
    const converted = (amount / rates[currency]) * INTERNATIONAL_PRICE_MULTIPLIER;
    return new Intl.NumberFormat(locales[currency], {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  }

  const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${inr} INR`;
}

export const formatINR = (amount: number) => formatAs(amount, detectDisplayCurrency());
