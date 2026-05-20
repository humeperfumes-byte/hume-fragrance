import { INDIA_SITE_HOST, PRIMARY_SITE_HOST } from "@/lib/site";

const DEFAULT_ALLOWED_RAZORPAY_HOSTS = [
  PRIMARY_SITE_HOST,
  PRIMARY_SITE_HOST.replace(/^www\./, ""),
  INDIA_SITE_HOST,
  INDIA_SITE_HOST.replace(/^www\./, ""),
  "localhost",
  "127.0.0.1",
  "[::1]",
];

export function normalizePaymentHost(host: string | null | undefined) {
  const raw = String(host ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(",")[0]
    .trim();

  if (!raw) return "";
  if (raw.startsWith("[::1]")) return "[::1]";
  return raw.split(":")[0].replace(/^www\./, "");
}

function getAllowedRazorpayHosts(allowedHosts?: string | null) {
  const configuredHosts = String(allowedHosts ?? "")
    .split(",")
    .map(normalizePaymentHost)
    .filter(Boolean);

  const hosts = configuredHosts.length > 0
    ? configuredHosts
    : DEFAULT_ALLOWED_RAZORPAY_HOSTS.map(normalizePaymentHost);

  return new Set(hosts);
}

export function isRazorpayAllowedHost(
  host: string | null | undefined,
  allowedHosts?: string | null,
) {
  const normalizedHost = normalizePaymentHost(host);
  if (!normalizedHost) return false;
  return getAllowedRazorpayHosts(allowedHosts).has(normalizedHost);
}

export function getRequestHost(headers: Headers) {
  return (
    headers.get("x-forwarded-host") ||
    headers.get("host") ||
    headers.get("origin") ||
    headers.get("referer") ||
    ""
  );
}
