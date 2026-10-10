import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripRegionPrefix } from "@/lib/region-routing";
import { isPrivateCustomerPath } from "@/lib/private-customer-path";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { prefix, pathWithoutPrefix } = stripRegionPrefix(pathname);

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
      ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; connect-src 'self' https://*.razorpay.com; img-src 'self' data: https://res.cloudinary.com https://*.razorpay.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://*.razorpay.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
      : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|apple-icon.png).*)"],
};
