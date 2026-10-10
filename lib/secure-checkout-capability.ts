import { createHash, timingSafeEqual } from "node:crypto";
export const CHECKOUT_OWNER_COOKIE = "hume_checkout_owner";
export const CHECKOUT_ACTIVE_COOKIE = "hume_checkout_active";
export function deriveOrderToken(checkoutToken: string) {
  return createHash("sha256").update(`HUME:order:v1:${checkoutToken}`).digest("base64url");
}
export function ownsCheckout(owner: string | undefined, expectedHash: string) {
  if (!owner || !/^[A-Za-z0-9_-]{43}$/.test(owner)) return false;
  const actual = createHash("sha256").update(owner).digest();
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
