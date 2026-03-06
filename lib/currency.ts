const INR_TO_USD_RATE = 83; // fallback display rates
const INR_TO_CAD_RATE = 61;
const INR_TO_EUR_RATE = 90;
const INR_TO_AUD_RATE = 55;
const INR_TO_SAR_RATE = 22;
const INR_TO_AED_RATE = 23;
const INTERNATIONAL_PRICE_MULTIPLIER = 2;

type DisplayCurrency = "INR" | "USD" | "CAD" | "EUR" | "AUD" | "SAR" | "AED";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function detectDisplayCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "INR";

  const country = (getCookie("hf_country") || "").toUpperCase();
  if (country === "IN") return "INR";
  if (country === "CA") return "CAD";
  if (country === "AU") return "AUD";
  if (country === "SA") return "SAR";
  if (country === "AE") return "AED";
  if (
    [
      "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
    ].includes(country)
  ) {
    return "EUR";
  }
  if (country) return "USD";

  // Fallback only when country cookie is unavailable.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const locale = (navigator.language || "").toUpperCase();
  if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta" || locale.endsWith("-IN")) return "INR";
  // Keep first paint deterministic with server-rendered HTML.
  // If country cookie is not present yet, default to INR on client as well.
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
