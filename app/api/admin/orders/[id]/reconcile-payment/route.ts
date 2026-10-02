import { NextRequest, NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/admin-auth";
import { reconcileOrderPayment } from "@/lib/razorpay-reconciliation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MANUAL_LINK_CHANNEL } from "@/lib/manual-order";
import { reconcileManualPayment } from "@/lib/manual-order-payment";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    const result = order?.checkoutChannel === MANUAL_LINK_CHANNEL ? await reconcileManualPayment(id) : await reconcileOrderPayment(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("Manual Razorpay reconciliation failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment reconciliation failed" }, { status: 500 });
  }
}
