import { NextRequest, NextResponse } from "next/server";

import { reconcilePendingRazorpayOrders } from "@/lib/razorpay-reconciliation";
import { reportServerError } from "@/lib/server-error-monitoring";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const result = await reconcilePendingRazorpayOrders(75);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    await reportServerError("PAYMENT_VERIFY_FAILED");
    return NextResponse.json({ ok: false, error: "Reconciliation failed" }, { status: 500 });
  }
}
