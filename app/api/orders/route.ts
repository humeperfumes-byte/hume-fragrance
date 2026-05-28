import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import {
  sendAdminOrderAlert,
  shouldSendAdminOrderAlert,
} from "@/lib/notifications/admin-order-alert";
import { resolveIndiaAwareCountry } from "@/lib/admin-market";
import { isAdminCapturedPath, isInternalAdminRequest } from "@/lib/admin-data-filters";
import { eq } from "drizzle-orm";

const fragranceSelectionSchema = z.object({
  id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  inspiration: z.string().max(255).optional(),
});

const cartItemSchema = z.object({
  id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  inspiration: z.string().max(255).optional(),
  size: z.string().max(100).optional(),
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  isGift: z.boolean().optional(),
  kitSelections: z
    .array(fragranceSelectionSchema)
    .optional(),
  sampleSelections: z
    .array(fragranceSelectionSchema)
    .optional(),
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
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(180).optional(),
  utmTerm: z.string().max(180).optional(),
  utmContent: z.string().max(180).optional(),
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

function getRequestOrigin(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const requestUrl = new URL(request.url);
  return `${forwardedProto}://${forwardedHost || host || requestUrl.host}`;
}

function getCapturedPath(request: NextRequest, path?: string) {
  if (path?.startsWith("http://") || path?.startsWith("https://")) {
    return path;
  }
  if (path?.startsWith("/")) {
    return `${getRequestOrigin(request)}${path}`;
  }
  return path || request.url;
}

function shouldSendOrderConfirmation(status: string, previousStatus?: string) {
  if (["payment_pending", "payment_authorized", "payment_failed"].includes(status)) {
    return false;
  }

  return previousStatus !== status;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = orderSchema.parse(body);

    if (isAdminCapturedPath(data.path)) {
      return NextResponse.json({ ok: true, skipped: "admin_page" });
    }

    if (isInternalAdminRequest(request) && data.acquisitionSource === "admin") {
      return NextResponse.json({ ok: true, skipped: "admin_traffic" });
    }

    const [existingOrder] = await db
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, data.id))
      .limit(1);

    const capturedPath = getCapturedPath(request, data.path);
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;
    const userAgent = request.headers.get("user-agent");
    const headerCountry =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;
    const country = resolveIndiaAwareCountry({
      headerCountry,
      phone: data.details.phone,
      pincode: data.details.pincode,
      state: data.details.state,
    });

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
        path: capturedPath,
        acquisitionSource: data.acquisitionSource ?? null,
        acquisitionCategory: data.acquisitionCategory ?? null,
        acquisitionReferrerHost: data.acquisitionReferrerHost ?? null,
        utmSource: data.utmSource ?? null,
        utmMedium: data.utmMedium ?? null,
        utmCampaign: data.utmCampaign ?? null,
        utmTerm: data.utmTerm ?? null,
        utmContent: data.utmContent ?? null,
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
          path: capturedPath,
          acquisitionSource: data.acquisitionSource ?? null,
          acquisitionCategory: data.acquisitionCategory ?? null,
          acquisitionReferrerHost: data.acquisitionReferrerHost ?? null,
          utmSource: data.utmSource ?? null,
          utmMedium: data.utmMedium ?? null,
          utmCampaign: data.utmCampaign ?? null,
          utmTerm: data.utmTerm ?? null,
          utmContent: data.utmContent ?? null,
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

    // Send order confirmation email asynchronously, but only after the order
    // leaves transient payment states.
    if (
      data.details.email &&
      shouldSendOrderConfirmation(data.status, existingOrder?.status)
    ) {
      sendOrderConfirmationEmail(data).catch((err) => {
        console.error("Async email send failed:", err);
      });
    }

    if (shouldSendAdminOrderAlert(data.status, existingOrder?.status)) {
      sendAdminOrderAlert({
        orderNumber: data.orderNumber,
        status: data.status,
        checkoutChannel: data.checkoutChannel,
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        subtotal: data.subtotal,
        shippingFee: data.shippingFee,
        grandTotal: data.grandTotal,
        details: data.details,
        cartSnapshot: data.cartSnapshot,
      }).catch((err) => {
        console.error("Async admin order alert failed:", err);
      });
    }

    return NextResponse.json({ ok: true, orderId: data.id, orderNumber: data.orderNumber });
  } catch (error) {
    console.error("orders capture error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
