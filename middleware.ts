import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { regionFromCountry } from "@/lib/geo";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("cloudfront-viewer-country") ||
    request.headers.get("x-country-code");

  if (country) {
    const normalizedCountry = country.toUpperCase();
    response.cookies.set("hf_country", country.toUpperCase(), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set("hf_region", regionFromCountry(normalizedCountry), {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else if (request.nextUrl.hostname === "localhost") {
    response.cookies.set("hf_country", "IN", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("hf_region", "IN", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
