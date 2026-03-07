import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getRegionConfigFromCountry,
  getRegionConfigFromPrefix,
  stripRegionPrefix,
  withRegionPrefix,
} from "@/lib/region-routing";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const { prefix, pathWithoutPrefix } = stripRegionPrefix(pathname);

  const countryFromHeader =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("cloudfront-viewer-country") ||
    request.headers.get("x-country-code");

  const cookiePrefix = request.cookies.get("hf_region_prefix")?.value;
  const fallbackCountry = countryFromHeader || request.cookies.get("hf_country")?.value || "IN";
  const preferredConfig = getRegionConfigFromCountry(fallbackCountry);

  if (prefix) {
    const config = getRegionConfigFromPrefix(prefix);
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathWithoutPrefix;
    const response = NextResponse.rewrite(rewriteUrl);
    response.cookies.set("hf_country", config.country, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region", config.region, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_currency", config.currency, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region_prefix", prefix, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  const stickyConfig = getRegionConfigFromPrefix(cookiePrefix);
  // Always trust fresh geo header first. Use sticky cookie only when headers are unavailable.
  const activeConfig = countryFromHeader ? preferredConfig : (cookiePrefix ? stickyConfig : preferredConfig);
  const shouldRedirectToPrefixedRoute = activeConfig.prefix !== "";

  if (shouldRedirectToPrefixedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = withRegionPrefix(pathname, activeConfig.prefix);
    redirectUrl.search = search;
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("hf_country", activeConfig.country, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region", activeConfig.region, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_currency", activeConfig.currency, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region_prefix", activeConfig.prefix, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  const response = NextResponse.next();
  const country =
    countryFromHeader || "IN";

  if (country) {
    const config = getRegionConfigFromCountry(country);
    response.cookies.set("hf_country", config.country, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region", config.region, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_currency", config.currency, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region_prefix", "", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|apple-icon.png).*)"],
};
