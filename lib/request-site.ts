import { headers } from "next/headers";
import { getSiteUrlFromHost } from "@/lib/site";

export async function getRequestSiteUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = headerStore.get("host");

  return getSiteUrlFromHost(forwardedHost ?? host);
}
