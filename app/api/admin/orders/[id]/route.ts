import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminToken } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  try {
    const data = await req.json();
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Filter out restricted fields if any, but for admin we allow most
    const { id: _id, orderNumber: _orderNumber, createdAt: _createdAt, ...updateData } = data;

    await db.update(orders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
