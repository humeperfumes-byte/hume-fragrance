import { db } from "@/db";
import { coupons } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { CouponData } from "@/data/coupons";

type CouponRow = typeof coupons.$inferSelect;

function transformCoupon(row: CouponRow): CouponData {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    type: row.type,
    value: parseFloat(row.value),
    minSubtotal: parseFloat(row.minSubtotal),
    active: Boolean(row.active),
    displayInCart: Boolean(row.displayInCart),
  };
}

export async function getActiveCoupons(options?: { cartOnly?: boolean }): Promise<CouponData[]> {
  const cartOnly = options?.cartOnly ?? false;
  try {
    const whereClause = cartOnly
      ? and(eq(coupons.active, true), eq(coupons.displayInCart, true))
      : eq(coupons.active, true);

    const rows = await db.select().from(coupons).where(whereClause);
    return rows.map(transformCoupon);
  } catch (error) {
    console.error("Error loading coupons from DB:", error);
    return [];
  }
}

export async function getCouponByCode(code: string): Promise<CouponData | null> {
  try {
    const [row] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.active, true)))
      .limit(1);
    if (!row) return null;
    return transformCoupon(row);
  } catch (error) {
    console.error(`Error loading coupon ${code} from DB:`, error);
    return null;
  }
}
