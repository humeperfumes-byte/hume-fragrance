import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { coupons } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code must contain at least 3 characters")
      .max(32)
      .regex(/^[A-Za-z0-9_-]+$/, "Use only letters, numbers, hyphens or underscores"),
    title: z.string().trim().min(2, "Coupon title is required").max(120),
    description: z.string().trim().max(400).optional().default(""),
    type: z.enum(["fixed", "percent"]),
    value: z.coerce.number().positive("Discount value must be greater than zero"),
    minSubtotal: z.coerce.number().min(0).default(0),
    active: z.boolean().default(true),
    displayInCart: z.boolean().default(false),
    welcomeBackMode: z.enum(["allow", "cap_5", "disable"]).default("allow"),
  })
  .superRefine((value, context) => {
    if (value.type === "percent" && value.value > 100) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["value"],
        message: "Percentage discount cannot exceed 100%",
      });
    }
  });

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
        description:
          input.description ||
          (input.type === "percent"
            ? `${input.value}% off above ₹${input.minSubtotal}`
            : `₹${input.value} off above ₹${input.minSubtotal}`),
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
