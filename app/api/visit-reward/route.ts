import { NextRequest, NextResponse } from "next/server";
import { secureCheckoutEnabled } from "@/lib/secure-checkout";
import { VISIT_REWARD_COOKIE, readVisitReward, advanceVisitReward, signVisitReward, publicVisitReward } from "@/lib/server-visit-reward";
export async function POST(request: NextRequest) {
  if (!secureCheckoutEnabled()) return NextResponse.json({ enabled: false });
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const secret = process.env.CHECKOUT_SESSION_SIGNING_SECRET;
  if (!secret) return NextResponse.json({ enabled: true, reward: null }, { headers: { "Cache-Control": "private, no-store" } });
  const state = advanceVisitReward(readVisitReward(request.cookies.get(VISIT_REWARD_COOKIE)?.value, secret));
  const response = NextResponse.json({ enabled: true, reward: publicVisitReward(state) }, { headers: { "Cache-Control": "private, no-store" } });
  response.cookies.set(VISIT_REWARD_COOKIE, signVisitReward(state, secret), { path: "/", httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", maxAge: 86400 });
  return response;
}
