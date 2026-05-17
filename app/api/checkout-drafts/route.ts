import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { resolveIndiaAwareCountry } from "@/lib/admin-market";
import { isInternalAdminRequest } from "@/lib/admin-data-filters";

const cartItemSchema = z.object({
  id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  inspiration: z.string().max(255).optional(),
  size: z.string().max(100).optional(),
  quantity: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  isGift: z.boolean().optional(),
});

const checkoutDraftSchema = z.object({
  sessionId: z.string().min(4).max(255),
  status: z.enum(["started", "partial", "complete", "whatsapp_initiated"]).default("partial"),
  path: z.string().max(2048).optional(),
  lastEditedField: z.string().max(100).optional(),
  acquisitionSource: z.string().max(100).optional(),
  acquisitionCategory: z.string().max(50).optional(),
  acquisitionReferrerHost: z.string().max(255).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(180).optional(),
  utmTerm: z.string().max(180).optional(),
  utmContent: z.string().max(180).optional(),
  subtotal: z.number().nonnegative().optional(),
  shippingFee: z.number().nonnegative().optional(),
  grandTotal: z.number().nonnegative().optional(),
  cartSnapshot: z.array(cartItemSchema).optional(),
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
  if (isInternalAdminRequest(request)) {
    return NextResponse.json({ ok: true, skipped: "admin_traffic" });
  }

  try {
    const body = await request.json();
    const data = checkoutDraftSchema.parse(body);

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
      .insert(checkoutDrafts)
      .values({
        id: crypto.randomUUID(),
        sessionId: data.sessionId,
        status: data.status,
        path: data.path ?? null,
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
        lastEditedField: data.lastEditedField ?? null,
        subtotal: typeof data.subtotal === "number" ? data.subtotal.toFixed(2) : null,
        shippingFee: typeof data.shippingFee === "number" ? data.shippingFee.toFixed(2) : null,
        grandTotal: typeof data.grandTotal === "number" ? data.grandTotal.toFixed(2) : null,
        cartSnapshot: data.cartSnapshot ?? [],
        country,
        ipAddress,
        userAgent,
        updatedAt: new Date(),
        whatsappInitiatedAt: data.status === "whatsapp_initiated" ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: checkoutDrafts.sessionId,
        set: {
          status: data.status,
          path: data.path ?? null,
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
          lastEditedField: data.lastEditedField ?? null,
          subtotal: typeof data.subtotal === "number" ? data.subtotal.toFixed(2) : null,
          shippingFee: typeof data.shippingFee === "number" ? data.shippingFee.toFixed(2) : null,
          grandTotal: typeof data.grandTotal === "number" ? data.grandTotal.toFixed(2) : null,
          cartSnapshot: data.cartSnapshot ?? [],
          country,
          ipAddress,
          userAgent,
          updatedAt: new Date(),
          whatsappInitiatedAt:
            data.status === "whatsapp_initiated" ? new Date() : null,
        },
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("checkout-drafts capture error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
