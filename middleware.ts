import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripRegionPrefix, withRegionPrefix } from "@/lib/region-routing";
import { isPrivateCustomerPath } from "@/lib/private-customer-path";
import { DISCOVERY_SET_PATH, DISCOVERY_SET_LEGACY_PATH, DISCOVERY_SET_LEGACY_TEN_PATH } from "@/lib/discovery-set";
import { getDiscoverySetSeoPageBySlug } from "@/lib/discovery-set-seo";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { prefix, pathWithoutPrefix } = stripRegionPrefix(pathname);

  // Redirect before the layout streams: a page-level redirect may otherwise
  // arrive as HTTP 200 with a client/meta refresh instead of a real 308.
  const discoverySlug = pathWithoutPrefix.match(/^\/discovery-set\/([^/]+)\/?$/)?.[1];
  if (pathWithoutPrefix === DISCOVERY_SET_LEGACY_PATH || pathWithoutPrefix === DISCOVERY_SET_LEGACY_TEN_PATH || (discoverySlug && getDiscoverySetSeoPageBySlug(discoverySlug))) {
    const destination=request.nextUrl.clone();
    destination.pathname=withRegionPrefix(DISCOVERY_SET_PATH,prefix);
    return NextResponse.redirect(destination,308);
  }
  if (discoverySlug && pathWithoutPrefix.replace(/\/$/, "") !== DISCOVERY_SET_PATH) {
    const missing=request.nextUrl.clone();missing.pathname="/404";
    return NextResponse.rewrite(missing,{status:404});
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathWithoutPrefix;
  const response = prefix ? NextResponse.rewrite(rewriteUrl) : NextResponse.next();
  if (isPrivateCustomerPath(pathname)) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    // Token pages must not execute third-party analytics or transmit the URL.
    const paymentPage = pathWithoutPrefix.startsWith("/checkout/");
    response.headers.set("Content-Security-Policy", paymentPage
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com; connect-src 'self' https://*.razorpay.com; img-src 'self' data: https://res.cloudinary.com https://*.razorpay.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://*.razorpay.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|apple-icon.png).*)"],
};
