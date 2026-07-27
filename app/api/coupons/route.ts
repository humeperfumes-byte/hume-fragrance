import { NextResponse } from "next/server";
import { getActiveCoupons } from "@/lib/db/coupons";
import { db } from "@/db";
import { coupons as couponsTable } from "@/db/schema";
import { coupons as couponsData } from "@/data/coupons";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get("includeHidden") === "1";

    // Auto-seed missing static coupons into PostgreSQL DB
    for (const c of couponsData) {
      try {
        await db
          .insert(couponsTable)
          .values({
            id: c.id,
            code: c.code,
            title: c.title,
            description: c.description,
            type: c.type,
            value: c.value.toString(),
            minSubtotal: c.minSubtotal.toString(),
            active: c.active,
            displayInCart: c.displayInCart,
            welcomeBackMode: c.welcomeBackMode,
          })
          .onConflictDoNothing();
      } catch {}
    }

    const activeCoupons = await getActiveCoupons({ cartOnly: !includeHidden });
    return NextResponse.json(activeCoupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, code, title, description, type, value, minSubtotal, active, displayInCart, welcomeBackMode } = body;

    const couponCode = String(code || "").trim().toUpperCase();
    if (!couponCode) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const couponId = id || couponCode.toLowerCase().replace(/[^a-z0-9]/g, "");

    await db
      .insert(couponsTable)
      .values({
        id: couponId,
        code: couponCode,
        title: title || "Flat ₹100 Off",
        description: description || "Special Ahmedabad Flyer Voucher - Flat ₹100 OFF on your order",
        type: type || "fixed",
        value: String(value ?? 100),
        minSubtotal: String(minSubtotal ?? 0),
        active: active ?? true,
        displayInCart: displayInCart ?? false,
        welcomeBackMode: welcomeBackMode || "allow",
      })
      .onConflictDoUpdate({
        target: couponsTable.id,
        set: {
          code: couponCode,
          title: title || "Flat ₹100 Off",
          description: description || "Special Ahmedabad Flyer Voucher - Flat ₹100 OFF on your order",
          type: type || "fixed",
          value: String(value ?? 100),
          minSubtotal: String(minSubtotal ?? 0),
          active: active ?? true,
          displayInCart: displayInCart ?? false,
          welcomeBackMode: welcomeBackMode || "allow",
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true, message: `Coupon ${couponCode} saved to database.` });
  } catch (error) {
    console.error("Error saving coupon:", error);
    return NextResponse.json({ error: "Failed to save coupon" }, { status: 500 });
  }
}
