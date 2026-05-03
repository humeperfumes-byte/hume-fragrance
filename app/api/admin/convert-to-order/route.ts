import { NextResponse } from "next/server";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const { draftId } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "Draft ID is required" }, { status: 400 });
    }

    // 1. Fetch the draft
    const [draft] = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.id, draftId));

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // 2. Generate Order Number (HME-XXXXX)
    const orderNumber = `HME-${Math.floor(10000 + Math.random() * 90000)}`;

    // 3. Create the Order
    await db.insert(orders).values({
      id: randomUUID(),
      orderNumber,
      sessionId: draft.sessionId,
      status: "processing", // Manual orders start at processing
      checkoutChannel: "manual_admin",
      fullName: draft.fullName,
      phone: draft.phone,
      email: draft.email,
      addressLine1: draft.addressLine1,
      addressLine2: draft.addressLine2,
      city: draft.city,
      state: draft.state,
      pincode: draft.pincode,
      notes: draft.notes,
      subtotal: draft.subtotal,
      shippingFee: draft.shippingFee,
      grandTotal: draft.grandTotal,
      cartSnapshot: draft.cartSnapshot,
      country: draft.country,
      ipAddress: draft.ipAddress,
      userAgent: draft.userAgent,
    });

    // 4. Update Draft Status
    await db.update(checkoutDrafts)
      .set({ status: "promoted", updatedAt: new Date() })
      .where(eq(checkoutDrafts.id, draftId));

    return NextResponse.json({ ok: true, orderNumber });
  } catch (error) {
    console.error("Failed to convert draft to order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
