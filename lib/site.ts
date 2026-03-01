export const SITE_URL = "https://humefragrance.com";

export function siteUrl(path: string = "/") {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

