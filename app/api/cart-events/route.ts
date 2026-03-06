import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { cartEvents } from "@/db/schema";

const cartEventSchema = z.object({
  sessionId: z.string().min(4).max(255),
  eventType: z.enum([
    "cart_open",
    "add_to_cart",
    "update_cart_quantity",
    "remove_from_cart",
  ]),
  path: z.string().max(2048).optional(),
  productId: z.string().max(255).optional(),
  productName: z.string().max(255).optional(),
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative().optional(),
  isGift: z.boolean().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = cartEventSchema.parse(body);

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const userAgent = request.headers.get("user-agent");
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    await db.insert(cartEvents).values({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      eventType: data.eventType,
      path: data.path ?? null,
      productId: data.productId ?? null,
      productName: data.productName ?? null,
      price: typeof data.price === "number" ? data.price.toFixed(2) : null,
      quantity: data.quantity ?? null,
      isGift: data.isGift ?? null,
      country,
      ipAddress,
      userAgent,
      payload: data.payload ?? {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("cart-events capture error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

