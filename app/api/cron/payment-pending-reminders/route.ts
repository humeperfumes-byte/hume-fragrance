import { NextRequest, NextResponse } from "next/server";

import { sendPaymentPendingReminders } from "@/lib/whatsapp/payment-pending-reminders";

export const dynamic = "force-dynamic";

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return request.headers.get("user-agent")?.toLowerCase().includes("vercel-cron") ?? false;
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sendPaymentPendingReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Payment pending reminder cron failed:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send payment pending reminders" },
      { status: 500 },
    );
  }
}
