import { NextRequest, NextResponse } from "next/server";
import { buildCouponEmailHtml } from "@/lib/email/coupon-template";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") || "HUME_EARLY_BIRD").toUpperCase();
  const email = searchParams.get("email") || "athensdubey@example.com";

  return new NextResponse(buildCouponEmailHtml(code, email), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
