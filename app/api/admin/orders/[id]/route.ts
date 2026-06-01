import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminToken } from "@/lib/admin-auth";

type OrderPatch = Partial<typeof orders.$inferInsert>;

const textFields = [
  "status",
  "checkoutChannel",
  "paymentMethod",
  "shippingMethod",
  "fulfillmentCarrier",
  "trackingNumber",
  "trackingUrl",
  "trackingStatus",
  "fullName",
  "phone",
  "email",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "pincode",
  "notes",
  "appliedCouponCode",
  "whatsappMessage",
] as const;

const moneyFields = ["subtotal", "shippingFee", "grandTotal"] as const;
const dateFields = ["trackingLastCheckedAt", "shippedAt", "deliveredAt"] as const;

function cleanText(value: unknown) {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function cleanMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(2) : undefined;
}

function cleanDate(value: unknown) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildOrderPatch(data: Record<string, unknown>): OrderPatch {
  const patch: OrderPatch = { updatedAt: new Date() };

  textFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      patch[field] = cleanText(data[field]);
    }
  });

  moneyFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      patch[field] = cleanMoney(data[field]);
    }
  });

  dateFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      patch[field] = cleanDate(data[field]);
    }
  });

  return patch;
}

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

    const updateData = buildOrderPatch(data);

    await db.update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(req);
  if (unauthorized) return unauthorized;

  try {
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    await db.delete(orders).where(eq(orders.id, orderId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
