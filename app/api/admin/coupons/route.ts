import { randomUUID } from "node:crypto";

import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import { couponDescription, couponInputSchema } from "@/lib/admin-coupon-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;
  try {
    const rows = await db.select().from(coupons).orderBy(asc(coupons.code));
    return NextResponse.json({ coupons: rows });
  } catch (error) {
    console.error("Admin coupon list error:", error);
    return NextResponse.json({ error: "Could not load coupons" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const input = couponInputSchema.parse(await request.json());
    const code = input.code.toUpperCase();
    const [existing] = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `Coupon ${code} already exists` },
        { status: 409 },
      );
    }

    const [created] = await db
      .insert(coupons)
      .values({
        id: `coupon-${randomUUID()}`,
        code,
        title: input.title,
        description: couponDescription(input),
        type: input.type,
        value: input.value.toFixed(2),
        minSubtotal: input.minSubtotal.toFixed(2),
        active: input.active,
        displayInCart: input.displayInCart,
        welcomeBackMode: input.welcomeBackMode,
      })
      .returning({
        id: coupons.id,
        code: coupons.code,
        title: coupons.title,
      });

    return NextResponse.json({ ok: true, coupon: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid coupon details" },
        { status: 400 },
      );
    }
    console.error("Admin coupon creation error:", error);
    return NextResponse.json({ error: "Could not create coupon" }, { status: 500 });
  }
}
