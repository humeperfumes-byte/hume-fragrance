import { stripRegionPrefix } from "./region-routing";
export const QR_ORIGIN = "https://www.humefragrance.com";

export function normalizeQrDestination(input: string): string {
  const value = input.trim();
  if (!value || value.length > 2048 || value.startsWith("//"))
    throw new Error(
      "Enter a site route or a complete HTTP/HTTPS URL (maximum 2048 characters).",
    );
  if (!value.startsWith("/") && !/^https?:\/\//i.test(value))
    throw new Error(
      "Start a site route with / or enter a complete https:// URL.",
    );
  const url = new URL(value, QR_ORIGIN);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Use HTTP or HTTPS without credentials.");
  const path = stripRegionPrefix(
    decodeURIComponent(url.pathname),
  ).pathWithoutPrefix;
  if (
    /^\/(?:q(?:\/|$)|api(?:\/|$)|admin(?:\/|$))/.test(path) &&
    ["humefragrance.com", "www.humefragrance.com"].includes(url.hostname)
  )
    throw new Error(
      "Choose a public destination outside QR redirects, admin and API routes.",
    );
  return url.toString();
}

export function qrDevice(agent: string) {
  return /bot|crawler|spider|preview|facebookexternalhit|headless/i.test(agent)
    ? "bot"
    : /ipad|tablet/i.test(agent)
      ? "Tablet"
      : /mobile|android|iphone/i.test(agent)
        ? "Mobile"
        : "Desktop";
}
export function qrBrowser(agent: string) {
  return /Edg\//.test(agent)
    ? "Edge"
    : /Firefox\//.test(agent)
      ? "Firefox"
      : /Chrome\//.test(agent)
        ? "Chrome"
        : /Safari\//.test(agent)
          ? "Safari"
          : "Other";
}

export function qrScanCsv(
  rows: {
    scanned_at: string;
    device: string;
    browser: string;
    referrer_host: string | null;
  }[],
) {
  const cell = (value: string) =>
    `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
  return [
    "Time (UTC),Device,Browser,Referrer host",
    ...rows.map((row) =>
      [
        new Date(row.scanned_at).toISOString(),
        row.device,
        row.browser,
        row.referrer_host || "Direct / camera",
      ]
        .map(cell)
        .join(","),
    ),
  ].join("\r\n");
}
