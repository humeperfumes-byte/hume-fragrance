export type AdminMarket = "india" | "out_of_india" | "all";

export function parseAdminMarket(value: string | string[] | null | undefined): AdminMarket {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "out_of_india") return "out_of_india";
  if (raw === "all") return "all";
  return "india";
}

export function isIndiaCountry(value: string | null | undefined): boolean {
  return String(value ?? "").trim().toUpperCase() === "IN";
}

export function isLegacyIndiaCountry(value: string | null | undefined): boolean {
  const country = String(value ?? "").trim().toUpperCase();
  // Older analytics rows were captured as Singapore by infrastructure/header bugs.
  return country === "SG";
}

export function isIndiaOperationalCountry(value: string | null | undefined): boolean {
  return isIndiaCountry(value) || isLegacyIndiaCountry(value);
}

export function isIndiaTimezone(value: string | null | undefined): boolean {
  const timezone = String(value ?? "").trim().toLowerCase();
  return timezone === "asia/kolkata" || timezone === "asia/calcutta";
}

export function isIndiaMarket(market: AdminMarket): boolean {
  return market === "india";
}

export function isOutOfIndiaMarket(market: AdminMarket): boolean {
  return market === "out_of_india";
}

export function isIndiaPhone(value: string | null | undefined): boolean {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return false;

  const local = digits.length === 12 && digits.startsWith("91")
    ? digits.slice(2)
    : digits.length >= 10
      ? digits.slice(-10)
      : digits;

  return /^[6-9]\d{9}$/.test(local);
}

export function isIndiaPincode(value: string | null | undefined): boolean {
  const digits = String(value ?? "").replace(/\D/g, "");
  return /^[1-9]\d{5}$/.test(digits);
}

export function isIndiaState(value: string | null | undefined): boolean {
  const state = String(value ?? "").trim().toLowerCase();
  if (!state) return false;

  return new Set([
    "andhra pradesh",
    "arunachal pradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "delhi",
    "goa",
    "gujarat",
    "haryana",
    "himachal pradesh",
    "jharkhand",
    "karnataka",
    "kerala",
    "madhya pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "orissa",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamil nadu",
    "telangana",
    "tripura",
    "uttar pradesh",
    "uttarakhand",
    "west bengal",
    "jammu and kashmir",
    "ladakh",
    "puducherry",
    "chandigarh",
  ]).has(state);
}

export type IndiaCheckoutSignal = {
  country?: string | null;
  phone?: string | null;
  pincode?: string | null;
  state?: string | null;
};

export function isIndiaCheckoutSignal(row: IndiaCheckoutSignal): boolean {
  return (
    isIndiaOperationalCountry(row.country) ||
    isIndiaPhone(row.phone) ||
    isIndiaPincode(row.pincode) ||
    isIndiaState(row.state)
  );
}

export type IndiaLeadSignal = {
  country?: string | null;
  destination?: string | null;
};

export function isIndiaLeadSignal(row: IndiaLeadSignal): boolean {
  return isIndiaOperationalCountry(row.country) || isIndiaPhone(row.destination);
}

export type CapturedCountrySignal = IndiaCheckoutSignal & {
  headerCountry?: string | null;
  destination?: string | null;
};

export function resolveIndiaAwareCountry(signal: CapturedCountrySignal): string | null {
  if (
    isIndiaPhone(signal.phone) ||
    isIndiaPhone(signal.destination) ||
    isIndiaPincode(signal.pincode) ||
    isIndiaState(signal.state)
  ) {
    return "IN";
  }

  const country = String(signal.headerCountry ?? signal.country ?? "").trim().toUpperCase();
  return country || null;
}
