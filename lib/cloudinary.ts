type CloudinaryTransformOptions = {
  width?: number;
};

const BASE_TRANSFORMS = "f_auto,q_auto,dpr_auto";

export function withCloudinaryTransforms(
  url: string,
  { width }: CloudinaryTransformOptions = {}
): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const transforms = width ? `${BASE_TRANSFORMS},w_${width}` : BASE_TRANSFORMS;
  const marker = "/image/upload/";

  if (url.includes(`${marker}${transforms}/`)) {
    return url;
  }

  const [prefix, suffix] = url.split(marker);
  if (!prefix || !suffix) return url;

  // If URL already has transform segment, we prepend our baseline transforms
  // so delivery optimization is always enforced.
  return `${prefix}${marker}${transforms}/${suffix}`;
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
