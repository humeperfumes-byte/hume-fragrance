import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

function normalizePhone(value: string | null) {
  return value?.replace(/\D/g, "") || "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { id: orderId } = await params;
    const [selectedOrder] = await db
      .select({
        id: orders.id,
        sessionId: orders.sessionId,
        phone: orders.phone,
        email: orders.email,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!selectedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const phone = normalizePhone(selectedOrder.phone);
    const email = selectedOrder.email?.trim().toLowerCase() || "";
    const relatedOrderConditions: SQL[] = [eq(orders.sessionId, selectedOrder.sessionId)];
    const relatedCheckoutConditions: SQL[] = [eq(checkoutDrafts.sessionId, selectedOrder.sessionId)];

    if (phone) {
      relatedOrderConditions.push(
        sql`regexp_replace(coalesce(${orders.phone}, ''), '[^0-9]', '', 'g') = ${phone}`,
      );
      relatedCheckoutConditions.push(
        sql`regexp_replace(coalesce(${checkoutDrafts.phone}, ''), '[^0-9]', '', 'g') = ${phone}`,
      );
    }

    if (email) {
      relatedOrderConditions.push(sql`lower(trim(coalesce(${orders.email}, ''))) = ${email}`);
      relatedCheckoutConditions.push(sql`lower(trim(coalesce(${checkoutDrafts.email}, ''))) = ${email}`);
    }

    const [relatedOrders, relatedCheckouts] = await Promise.all([
      db
        .select({
          id: orders.id,
          reference: orders.orderNumber,
          status: orders.status,
          amount: orders.grandTotal,
          cartSnapshot: orders.cartSnapshot,
          path: orders.path,
          occurredAt: orders.createdAt,
        })
        .from(orders)
        .where(and(ne(orders.id, selectedOrder.id), or(...relatedOrderConditions)))
        .orderBy(desc(orders.createdAt))
        .limit(12),
      db
        .select({
          id: checkoutDrafts.id,
          status: checkoutDrafts.status,
          amount: checkoutDrafts.grandTotal,
          cartSnapshot: checkoutDrafts.cartSnapshot,
          path: checkoutDrafts.path,
          occurredAt: checkoutDrafts.updatedAt,
        })
        .from(checkoutDrafts)
        .where(
          and(
            ne(checkoutDrafts.sessionId, selectedOrder.sessionId),
            or(...relatedCheckoutConditions),
          ),
        )
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(12),
    ]);

    const activity = [
      ...relatedOrders.map((order) => ({
        id: order.id,
        type: "order" as const,
        reference: order.reference,
        status: order.status,
        amount: Number(order.amount || 0),
        itemCount: order.cartSnapshot.reduce((total, item) => total + Number(item.quantity || 0), 0),
        itemNames: order.cartSnapshot.slice(0, 3).map((item) => item.name),
        path: order.path,
        occurredAt: order.occurredAt,
      })),
      ...relatedCheckouts.map((checkout) => ({
        id: checkout.id,
        type: "checkout" as const,
        reference: `Checkout ${checkout.id.slice(-6).toUpperCase()}`,
        status: checkout.status,
        amount: Number(checkout.amount || 0),
        itemCount: checkout.cartSnapshot.reduce((total, item) => total + Number(item.quantity || 0), 0),
        itemNames: checkout.cartSnapshot.slice(0, 3).map((item) => item.name),
        path: checkout.path,
        occurredAt: checkout.occurredAt,
      })),
    ]
      .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
      .slice(0, 12);

    return NextResponse.json({ activity });
  } catch (error) {
    console.error("Failed to load customer order activity:", error);
    return NextResponse.json({ error: "Failed to load customer activity" }, { status: 500 });
  }
}
