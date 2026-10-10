import { createHash, randomBytes } from "node:crypto";
export type CustomerLinkScope = "order" | "checkout";
export function createCustomerToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashCustomerToken(token)! };
}
export function hashCustomerToken(token: string): string | null {
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? createHash("sha256").update(token).digest("hex") : null;
}
export function isUsableCustomerLink(link: { scope: string; expiresAt: Date; revokedAt: Date | null }, scope: CustomerLinkScope, now = new Date()) {
  return link.scope === scope && !link.revokedAt && link.expiresAt.getTime() > now.getTime();
}
