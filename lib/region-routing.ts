export type RegionPrefix = "" | "us" | "ca" | "au" | "eu" | "ae" | "sa";
export type DisplayCurrency = "INR" | "USD" | "CAD" | "EUR" | "AUD" | "SAR" | "AED";
export type GeoRegionCookie = "IN" | "US" | "CA" | "EU" | "AU" | "ME" | "INTL";

type RegionRoutingConfig = {
  prefix: RegionPrefix;
  country: string;
  region: GeoRegionCookie;
  currency: DisplayCurrency;
};

const PREFIXED_ROUTES: Record<Exclude<RegionPrefix, "">, RegionRoutingConfig> = {
  us: { prefix: "us", country: "US", region: "US", currency: "USD" },
  ca: { prefix: "ca", country: "CA", region: "CA", currency: "CAD" },
  au: { prefix: "au", country: "AU", region: "AU", currency: "AUD" },
  eu: { prefix: "eu", country: "DE", region: "EU", currency: "EUR" },
  ae: { prefix: "ae", country: "AE", region: "ME", currency: "AED" },
  sa: { prefix: "sa", country: "SA", region: "ME", currency: "SAR" },
};

const DEFAULT_INDIA_CONFIG: RegionRoutingConfig = {
  prefix: "",
  country: "IN",
  region: "IN",
  currency: "INR",
};

const EU_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
]);

export function getRegionConfigFromPrefix(prefix: string | null | undefined): RegionRoutingConfig {
  const normalized = (prefix || "").toLowerCase() as Exclude<RegionPrefix, "">;
  return PREFIXED_ROUTES[normalized] ?? DEFAULT_INDIA_CONFIG;
}

export function getPrefixFromCountry(countryCode: string | null | undefined): RegionPrefix {
  const code = (countryCode || "").toUpperCase();
  if (!code || code === "XX" || code === "T1" || code === "A1" || code === "A2") return "";
  if (code === "IN") return "";
  if (code === "US") return "us";
  if (code === "CA") return "ca";
  if (code === "AU") return "au";
  if (code === "AE") return "ae";
  if (code === "SA") return "sa";
  if (EU_COUNTRIES.has(code)) return "eu";
  return "";
}

export function getRegionConfigFromCountry(countryCode: string | null | undefined): RegionRoutingConfig {
  return getRegionConfigFromPrefix(getPrefixFromCountry(countryCode));
}

export function stripRegionPrefix(pathname: string): { prefix: RegionPrefix; pathWithoutPrefix: string } {
  const match = pathname.match(/^\/(us|ca|au|eu|ae|sa)(\/|$)/i);
  if (!match) return { prefix: "", pathWithoutPrefix: pathname };

  const prefix = match[1].toLowerCase() as Exclude<RegionPrefix, "">;
  const stripped = pathname.replace(new RegExp(`^/${prefix}`), "") || "/";
  return { prefix, pathWithoutPrefix: stripped };
}

export function withRegionPrefix(pathname: string, prefix: RegionPrefix): string {
  if (!prefix) return pathname || "/";
  const normalizedPath = pathname === "/" ? "" : pathname;
  return `/${prefix}${normalizedPath}` || `/${prefix}`;
}
