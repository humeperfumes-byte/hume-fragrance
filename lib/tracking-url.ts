export function buildPublicTrackingPath(trackingNumber: string | null | undefined) {
  const cleanTrackingNumber = String(trackingNumber || "").trim();
  if (!cleanTrackingNumber) return "";

  return `/track-order/${encodeURIComponent(cleanTrackingNumber)}`;
}

export function buildPublicTrackingUrl(
  trackingNumber: string | null | undefined,
  origin: string | null | undefined,
) {
  const path = buildPublicTrackingPath(trackingNumber);
  if (!path) return "";

  const cleanOrigin = String(origin || "").replace(/\/$/, "");
  return cleanOrigin ? `${cleanOrigin}${path}` : path;
}
