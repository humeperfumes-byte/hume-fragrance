import { NextRequest, NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/admin-auth";
import { reconcileOrderPayment } from "@/lib/razorpay-reconciliation";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const result = await reconcileOrderPayment(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Manual Razorpay reconciliation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment reconciliation failed" }, { status: 500 });
  }
}
