export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_UPLOAD_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function validateImageUpload(file: { type: string; size: number }) {
  if (!ALLOWED_IMAGE_UPLOAD_TYPES.has(file.type)) {
    return "Only PNG, JPG, WebP, GIF, or AVIF images are allowed";
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return "Image must be 10 MB or smaller";
  }
  return null;
}
