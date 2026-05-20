import { db } from "@/db";
import { coupons } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { CouponData } from "@/data/coupons";

type CouponRow = typeof coupons.$inferSelect;

const SPECIAL5_COUPON: CouponData = {
  id: "special-5",
  code: "SPECIAL-5",
  title: "Private 5% off",
  description: "Private cart recovery offer with 5% off and free delivery",
  type: "percent",
  value: 5,
  minSubtotal: 0,
  active: true,
  displayInCart: false,
  welcomeBackMode: "cap_5",
};

function withHiddenSpecialCoupon(rows: CouponData[], cartOnly: boolean) {
  if (cartOnly) return rows;
  if (rows.some((coupon) => coupon.code.toUpperCase() === SPECIAL5_COUPON.code)) return rows;
  return [...rows, SPECIAL5_COUPON];
}

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
    welcomeBackMode:
      row.welcomeBackMode === "allow" || row.welcomeBackMode === "disable"
        ? row.welcomeBackMode
        : "cap_5",
  };
}

export async function getActiveCoupons(options?: { cartOnly?: boolean }): Promise<CouponData[]> {
  const cartOnly = options?.cartOnly ?? false;
  try {
    const whereClause = cartOnly
      ? and(eq(coupons.active, true), eq(coupons.displayInCart, true))
      : eq(coupons.active, true);

    const rows = await db.select().from(coupons).where(whereClause);
    return withHiddenSpecialCoupon(rows.map(transformCoupon), cartOnly);
  } catch (error) {
    console.error("Error loading coupons from DB:", error);
    return withHiddenSpecialCoupon([], cartOnly);
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
