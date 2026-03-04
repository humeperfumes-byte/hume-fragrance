const INR_TO_USD_RATE = 83; // fallback display rate
const INTERNATIONAL_PRICE_MULTIPLIER = 2;

type DisplayCurrency = "INR" | "USD";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function detectDisplayCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "INR";

  // Strong India-first checks so Indian visitors don't get USD due to stale cookies.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const locale = (navigator.language || "").toUpperCase();
  if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta" || locale.endsWith("-IN")) return "INR";

  const country = (getCookie("hf_country") || "").toUpperCase();
  if (country && country !== "IN") return "USD";
  if (country === "IN") return "INR";
  // Keep first paint deterministic with server-rendered HTML.
  // If country cookie is not present yet, default to INR on client as well.
  return "INR";
}

function formatAs(amount: number, currency: DisplayCurrency) {
  if (currency === "USD") {
    // Outside India, show international price as 2x of INR->USD converted amount.
    const usd = (amount / INR_TO_USD_RATE) * INTERNATIONAL_PRICE_MULTIPLIER;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usd);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatINR = (amount: number) => formatAs(amount, detectDisplayCurrency());
