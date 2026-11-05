import { CHECKOUT_FEATURES } from "@/lib/checkout-settings";
import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customerAccessLinks } from "@/db/schema";
import { hashCustomerToken, isUsableCustomerLink, type CustomerLinkScope } from "./customer-access-token";
export function customerLinksEnabled(scope: CustomerLinkScope) {
  return scope === "order" ? CHECKOUT_FEATURES.customerOrderLinks : CHECKOUT_FEATURES.checkoutResumeLinks;
}
export async function resolveCustomerLink(token: string, scope: CustomerLinkScope) {
  if (!customerLinksEnabled(scope)) return null;
  const hash = hashCustomerToken(token); if (!hash) return null;
  const [link] = await db.select().from(customerAccessLinks).where(eq(customerAccessLinks.tokenHash, hash)).limit(1);
  return link && isUsableCustomerLink(link, scope) ? link.resourceId : null;
}
