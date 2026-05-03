import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    const orderId = params.id;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["whatsapp_initiated", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
