import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/db";
import { orderEditAudits, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminToken } from "@/lib/admin-auth";
import { MANUAL_LINK_CHANNEL, readManualPayment } from "@/lib/manual-order";
import { cancelManualLink } from "@/lib/manual-order-payment";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  try {
    const { status, reason } = await req.json();
    const { id: orderId } = await params;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const validStatuses = [
      "whatsapp_initiated",
      "payment_pending",
      "payment_authorized",
      "payment_failed",
      "refund_initiated",
      "partially_refunded",
      "refunded",
      "refund_failed",
      "payment_disputed",
      "dispute_action_required",
      "dispute_under_review",
      "dispute_won",
      "dispute_lost",
      "dispute_closed",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const now = new Date();
    const statusTimestamps =
      status === "delivered"
        ? { shippedAt: now, deliveredAt: now }
        : status === "shipped"
          ? { shippedAt: now, deliveredAt: null }
          : ["whatsapp_initiated", "payment_pending", "payment_authorized", "payment_failed", "processing", "packed"].includes(status)
            ? { shippedAt: null, deliveredAt: null }
            : {};

    const [current] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (current.checkoutChannel === MANUAL_LINK_CHANNEL) {
      const payment = readManualPayment(current.whatsappMessage);
      if (["payment_authorized", "processing", "packed", "shipped", "delivered"].includes(status) && (!payment || Math.round(Number(current.capturedPaymentAmount || 0) * 100) < payment.advanceMinor)) return NextResponse.json({ error: "Check Razorpay payment before processing or shipping this order" }, { status: 400 });
      if (status === "cancelled" && current.status !== "cancelled") await cancelManualLink(current);
    }
    const updated = await db.transaction(async (tx) => {
      const [order] = await tx.update(orders).set({ status, ...statusTimestamps, updatedAt: now }).where(eq(orders.id, orderId)).returning();
      await tx.insert(orderEditAudits).values({ id: `order-audit-${randomUUID()}`, orderId, changeType: reason ? "status_reversal" : "status", reason: typeof reason === "string" && reason.trim() ? reason.trim() : `Status changed from ${current.status} to ${status}`, actor: "admin", beforeSnapshot: current, afterSnapshot: order });
      return order;
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
