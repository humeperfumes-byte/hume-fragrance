type CloudinaryTransformOptions = {
  width?: number;
};

const BASE_TRANSFORMS = "f_auto,q_auto,dpr_auto";

export function withCloudinaryTransforms(
  url: string,
  { width }: CloudinaryTransformOptions = {}
): string {
  if (!url) return url;
  const cleanUrl = url.trim().replace(/[\r\n\t]+/g, "");
  if (!cleanUrl.includes("res.cloudinary.com") || !cleanUrl.includes("/image/upload/")) {
    return cleanUrl;
  }

  const transforms = width ? `${BASE_TRANSFORMS},w_${width}` : BASE_TRANSFORMS;
  const marker = "/image/upload/";

  const [prefix, rest] = cleanUrl.split(marker);
  if (!prefix || !rest) return cleanUrl;

  const versionOrPathIndex = rest.search(/(?:v\d+\/|[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+)/);
  const cleanSuffix = versionOrPathIndex !== -1 ? rest.slice(versionOrPathIndex) : rest;

  return `${prefix}${marker}${transforms}/${cleanSuffix}`;
}

export function getCloudinaryPublicIdFromUrl(imageUrl: string) {
  try {
    const url = new URL(imageUrl);
    if (!url.hostname.endsWith("cloudinary.com")) return null;

    const uploadMarker = "/image/upload/";
    const markerIndex = url.pathname.indexOf(uploadMarker);
    if (markerIndex === -1) return null;

    const afterUpload = url.pathname.slice(markerIndex + uploadMarker.length);
    const versionMatch = afterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
    const assetPath = versionMatch?.[1] || afterUpload;
    if (!assetPath) return null;

    return decodeURIComponent(assetPath).replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}
