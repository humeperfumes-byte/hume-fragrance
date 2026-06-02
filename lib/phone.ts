export function toPhoneDigits(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function toTenDigitPhone(value: string | null | undefined): string {
  const digits = toPhoneDigits(value);
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
  return digits.slice(0, 10);
}

export function displayPhoneNumber(value: string | null | undefined): string {
  return toTenDigitPhone(value) || String(value ?? "").trim();
}
