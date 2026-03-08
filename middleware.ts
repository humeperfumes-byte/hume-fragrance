import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripRegionPrefix } from "@/lib/region-routing";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { prefix, pathWithoutPrefix } = stripRegionPrefix(pathname);

  if (!prefix) {
    return NextResponse.next();
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = pathWithoutPrefix;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|apple-icon.png).*)"],
};
