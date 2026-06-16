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
