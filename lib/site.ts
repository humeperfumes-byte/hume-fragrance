export const PRIMARY_SITE_HOST = "www.humefragrance.com";
export const INDIA_SITE_HOST = "www.humefragrance.in";
export const SITE_URL = `https://${PRIMARY_SITE_HOST}`;

export function normalizeSiteHost(host?: string | null) {
  const cleanHost = String(host ?? "")
    .toLowerCase()
    .split(",")[0]
    .trim()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

  if (cleanHost === "humefragrance.in" || cleanHost === INDIA_SITE_HOST) {
    return INDIA_SITE_HOST;
  }

  return PRIMARY_SITE_HOST;
}

export function getSiteUrlFromHost(host?: string | null) {
  return `https://${normalizeSiteHost(host)}`;
}

export function siteUrlForBase(baseUrl: string, path: string = "/") {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  if (!path || path === "/") return cleanBase;
  return `${cleanBase}${path.startsWith("/") ? path : `/${path}`}`;
}

export function siteUrl(path: string = "/") {
  return siteUrlForBase(SITE_URL, path);
}
