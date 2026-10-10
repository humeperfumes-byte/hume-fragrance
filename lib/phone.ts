export function toPhoneDigits(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function toTenDigitPhone(value: string | null | undefined): string {
  const digits = toPhoneDigits(value);
  if (!digits) return "";

  const indiaAwareMatch = digits.match(/(?:91|0)?(\d{10})$/);
  if (indiaAwareMatch) return indiaAwareMatch[1];

  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function displayPhoneNumber(value: string | null | undefined): string {
  return toTenDigitPhone(value) || String(value ?? "").trim();
}
export function normalizeIndianMobile(value: string): string {
  const compact = value.trim().replace(/[\s().\-\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, "");
  if (/^\+91\d{10}$/.test(compact)) return compact.slice(3);
  if (/^0091\d{10}$/.test(compact)) return compact.slice(4);
  if (/^91\d{10}$/.test(compact)) return compact.slice(2);
  if (/^0\d{10}$/.test(compact)) return compact.slice(1);
  return compact;
}
