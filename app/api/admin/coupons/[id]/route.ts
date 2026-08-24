import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { couponCodeEvents, coupons, orders } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { couponDescription, couponInputSchema } from "@/lib/admin-coupon-schema";
import { coupons as staticCoupons } from "@/data/coupons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const input = couponInputSchema.parse(await request.json());
    const code = input.code.toUpperCase();
    const [duplicate] = await db.select({ id: coupons.id }).from(coupons)
      .where(and(eq(coupons.code, code), ne(coupons.id, id))).limit(1);
    if (duplicate) return NextResponse.json({ error: `Coupon ${code} already exists` }, { status: 409 });

    const [coupon] = await db.update(coupons).set({
      code, title: input.title, description: couponDescription(input), type: input.type,
      value: input.value.toFixed(2), minSubtotal: input.minSubtotal.toFixed(2), active: input.active,
      displayInCart: input.displayInCart, welcomeBackMode: input.welcomeBackMode,
      archivedAt: input.active ? null : undefined, updatedAt: new Date(),
    }).where(eq(coupons.id, id)).returning();
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json({ ok: true, coupon });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      const issue = (error as { issues?: Array<{ message?: string }> }).issues?.[0];
      return NextResponse.json({ error: issue?.message || "Invalid coupon details" }, { status: 400 });
    }
    console.error("Admin coupon update error:", error);
    return NextResponse.json({ error: "Could not update coupon" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await params;
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    const code = coupon.code.toUpperCase();
    const [[claim], [redemption]] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(couponCodeEvents).where(sql`upper(coalesce(${couponCodeEvents.couponCode}, '')) = ${code}`),
      db.select({ count: sql<number>`count(*)::int` }).from(orders).where(sql`${code} = any(string_to_array(replace(upper(coalesce(${orders.appliedCouponCode}, '')), ' ', ''), ','))`),
    ]);
    const used = Number(claim?.count || 0) + Number(redemption?.count || 0) > 0;
    const isSeededCoupon = staticCoupons.some((item) => item.id === coupon.id || item.code.toUpperCase() === code);
    if (used || isSeededCoupon) {
      const [archived] = await db.update(coupons).set({ active: false, displayInCart: false, archivedAt: new Date(), updatedAt: new Date() }).where(eq(coupons.id, id)).returning();
      return NextResponse.json({ ok: true, action: "archived", coupon: archived });
    }
    await db.delete(coupons).where(eq(coupons.id, id));
    return NextResponse.json({ ok: true, action: "deleted" });
  } catch (error) {
    console.error("Admin coupon delete error:", error);
    return NextResponse.json({ error: "Could not remove coupon" }, { status: 500 });
  }
}
