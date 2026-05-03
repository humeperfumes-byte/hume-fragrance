import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";

const cartItemSchema = z.object({
  id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  inspiration: z.string().max(255).optional(),
  size: z.string().max(100).optional(),
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  isGift: z.boolean().optional(),
});

const orderSchema = z.object({
  id: z.string().min(4).max(255),
  orderNumber: z.string().min(4).max(50),
  sessionId: z.string().min(4).max(255),
  status: z.string().max(50).default("whatsapp_initiated"),
  checkoutChannel: z.string().max(50).default("whatsapp"),
  paymentMethod: z.string().max(100).optional(),
  shippingMethod: z.string().max(100).optional(),
  path: z.string().max(2048).optional(),
  acquisitionSource: z.string().max(100).optional(),
  acquisitionCategory: z.string().max(50).optional(),
  acquisitionReferrerHost: z.string().max(255).optional(),
  appliedCouponCode: z.string().max(50).optional(),
  subtotal: z.number().nonnegative().optional(),
  shippingFee: z.number().nonnegative().optional(),
  grandTotal: z.number().nonnegative().optional(),
  whatsappMessage: z.string().max(20000).optional(),
  cartSnapshot: z.array(cartItemSchema).default([]),
  giftItems: z.array(z.string().max(255)).default([]),
  details: z
    .object({
      fullName: z.string().max(255).optional(),
      phone: z.string().max(50).optional(),
      email: z.string().max(255).optional(),
      addressLine1: z.string().max(2000).optional(),
      addressLine2: z.string().max(2000).optional(),
      city: z.string().max(255).optional(),
      state: z.string().max(255).optional(),
      pincode: z.string().max(20).optional(),
      notes: z.string().max(5000).optional(),
    })
    .default({}),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const userAgent = request.headers.get("user-agent");
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;

    await db
      .insert(orders)
      .values({
        id: data.id,
        orderNumber: data.orderNumber,
        sessionId: data.sessionId,
        status: data.status,
        checkoutChannel: data.checkoutChannel,
        paymentMethod: data.paymentMethod ?? null,
        shippingMethod: data.shippingMethod ?? null,
        path: data.path ?? null,
        acquisitionSource: data.acquisitionSource ?? null,
        acquisitionCategory: data.acquisitionCategory ?? null,
        acquisitionReferrerHost: data.acquisitionReferrerHost ?? null,
        fullName: data.details.fullName?.trim() || null,
        phone: data.details.phone?.trim() || null,
        email: data.details.email?.trim() || null,
        addressLine1: data.details.addressLine1?.trim() || null,
        addressLine2: data.details.addressLine2?.trim() || null,
        city: data.details.city?.trim() || null,
        state: data.details.state?.trim() || null,
        pincode: data.details.pincode?.trim() || null,
        notes: data.details.notes?.trim() || null,
        appliedCouponCode: data.appliedCouponCode?.trim().toUpperCase() || null,
        subtotal: typeof data.subtotal === "number" ? data.subtotal.toFixed(2) : null,
        shippingFee: typeof data.shippingFee === "number" ? data.shippingFee.toFixed(2) : null,
        grandTotal: typeof data.grandTotal === "number" ? data.grandTotal.toFixed(2) : null,
        whatsappMessage: data.whatsappMessage ?? null,
        cartSnapshot: data.cartSnapshot,
        giftItems: data.giftItems,
        country,
        ipAddress,
        userAgent,
        updatedAt: new Date(),
        whatsappInitiatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: orders.id,
        set: {
          orderNumber: data.orderNumber,
          sessionId: data.sessionId,
          status: data.status,
          checkoutChannel: data.checkoutChannel,
          paymentMethod: data.paymentMethod ?? null,
          shippingMethod: data.shippingMethod ?? null,
          path: data.path ?? null,
          acquisitionSource: data.acquisitionSource ?? null,
          acquisitionCategory: data.acquisitionCategory ?? null,
          acquisitionReferrerHost: data.acquisitionReferrerHost ?? null,
          fullName: data.details.fullName?.trim() || null,
          phone: data.details.phone?.trim() || null,
          email: data.details.email?.trim() || null,
          addressLine1: data.details.addressLine1?.trim() || null,
          addressLine2: data.details.addressLine2?.trim() || null,
          city: data.details.city?.trim() || null,
          state: data.details.state?.trim() || null,
          pincode: data.details.pincode?.trim() || null,
          notes: data.details.notes?.trim() || null,
          appliedCouponCode: data.appliedCouponCode?.trim().toUpperCase() || null,
          subtotal: typeof data.subtotal === "number" ? data.subtotal.toFixed(2) : null,
          shippingFee: typeof data.shippingFee === "number" ? data.shippingFee.toFixed(2) : null,
          grandTotal: typeof data.grandTotal === "number" ? data.grandTotal.toFixed(2) : null,
          whatsappMessage: data.whatsappMessage ?? null,
          cartSnapshot: data.cartSnapshot,
          giftItems: data.giftItems,
          country,
          ipAddress,
          userAgent,
          updatedAt: new Date(),
          whatsappInitiatedAt: new Date(),
        },
      });

    // Send order confirmation email asynchronously
    if (data.details.email) {
      sendOrderConfirmationEmail(data).catch((err) => {
        console.error("Async email send failed:", err);
      });
    }

    return NextResponse.json({ ok: true, orderId: data.id, orderNumber: data.orderNumber });
  } catch (error) {
    console.error("orders capture error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
