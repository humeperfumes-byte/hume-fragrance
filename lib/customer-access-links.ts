import { secureCheckoutConfigured } from "@/lib/checkout-settings";
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customerAccessLinks } from "@/db/schema";
import { hashCustomerToken, isUsableCustomerLink, type CustomerLinkScope } from "./customer-access-token";
export function customerLinksEnabled(scope: CustomerLinkScope) {
  return secureCheckoutConfigured() || process.env[scope === "order" ? "ENABLE_CUSTOMER_ORDER_LINKS" : "ENABLE_CHECKOUT_RESUME_LINKS"] === "true";
}
export async function resolveCustomerLink(token: string, scope: CustomerLinkScope) {
  if (!customerLinksEnabled(scope)) return null;
  const hash = hashCustomerToken(token); if (!hash) return null;
  const [link] = await db.select().from(customerAccessLinks).where(eq(customerAccessLinks.tokenHash, hash)).limit(1);
  return link && isUsableCustomerLink(link, scope) ? link.resourceId : null;
}
