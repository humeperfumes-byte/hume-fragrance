export type GeoRegion = "IN" | "US" | "CA" | "EU" | "AU" | "ME" | "INTL";

const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"
]);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function regionFromCountry(countryCode?: string): GeoRegion {
  const code = (countryCode || "").toUpperCase();
  if (code === "IN") return "IN";
  if (code === "US") return "US";
  if (code === "CA") return "CA";
  if (code === "AU") return "AU";
  if (code === "SA" || code === "AE") return "ME";
  if (EU_COUNTRIES.has(code)) return "EU";
  return "INTL";
}

export function detectGeoRegionClient(): GeoRegion {
  const region = (getCookie("hf_region") || "").toUpperCase();
  if (["IN", "US", "CA", "EU", "AU", "ME", "INTL"].includes(region)) {
    return region as GeoRegion;
  }
  const country = (getCookie("hf_country") || "").toUpperCase();
  return regionFromCountry(country);
}

export function getGeoExperience(region: GeoRegion) {
  if (region === "US") {
    return {
      announcement:
        "US shipping available - prices shown in USD - Use code HUME15 for 15% off your first order",
      heroBody:
        "Experience iconic fragrance profiles, meticulously reimagined. HUME delivers long-lasting luxury interpretations for modern everyday wear.",
      offers: ["Buy 3. Get 1 Complimentary", "US Shipping Available", "Premium Inspired EDPs"],
    };
  }
  if (region === "CA") {
    return {
      announcement:
        "Canada shipping available - prices shown in CAD - Use code HUME15 for 15% off your first order",
      heroBody:
        "Experience iconic fragrance profiles, meticulously reimagined. HUME crafts premium inspired EDPs with all-day performance.",
      offers: ["Buy 3. Get 1 Complimentary", "Canada Shipping Available", "Premium Inspired EDPs"],
    };
  }
  if (region === "EU") {
    return {
      announcement:
        "EU shipping available - prices shown in EUR - Use code HUME15 for 15% off your first order",
      heroBody:
        "Experience iconic fragrance profiles, meticulously reimagined. HUME creates refined luxury interpretations with reliable wear.",
      offers: ["Buy 3. Get 1 Complimentary", "EU Shipping Available", "Premium Inspired EDPs"],
    };
  }
  if (region === "AU") {
    return {
      announcement:
        "Australia shipping available - prices shown in AUD - Use code HUME15 for 15% off your first order",
      heroBody:
        "Experience iconic fragrance profiles, meticulously reimagined. HUME delivers premium inspired scents designed for everyday confidence.",
      offers: ["Buy 3. Get 1 Complimentary", "Australia Shipping Available", "Premium Inspired EDPs"],
    };
  }
  if (region === "INTL") {
    return {
      announcement:
        "International shipping available - premium inspired EDPs - Use code HUME15 for 15% off your first order",
      heroBody:
        "Experience iconic fragrance profiles, meticulously reimagined. HUME crafts refined luxury interpretations designed for everyday wear.",
      offers: ["Buy 3. Get 1 Complimentary", "International Shipping", "Premium Inspired EDPs"],
    };
  }

  if (region === "ME") {
    return {
      announcement:
        "Middle East shipping available - prices shown in local currency - Use code HUME15 for 15% off your first order",
      heroBody:
        "Experience iconic fragrance profiles, meticulously reimagined. HUME creates premium inspired EDPs with rich, long-lasting character.",
      offers: ["Buy 3. Get 1 Complimentary", "Middle East Shipping Available", "Premium Inspired EDPs"],
    };
  }

  // India - keep existing design/copy baseline.
  return {
    announcement:
      "Complimentary shipping on all orders above INR 799 - Use code HUME15 for 15% off your first order",
    heroBody:
      "Experience iconic fragrance profiles, meticulously reimagined. HUME crafts refined luxury interpretations designed for everyday wear.",
    offers: ["Buy 3. Get 1 Complimentary", "10% Off on 2 Perfumes", "30% Off on 3 Perfumes"],
  };
}
