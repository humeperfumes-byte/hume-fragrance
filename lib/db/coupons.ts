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

import { coupons as couponsData } from "@/data/coupons";

let isSeedingDone = false;
async function ensureCouponsSeeded() {
  if (isSeedingDone) return;
  try {
    isSeedingDone = true;
    for (const c of couponsData) {
      await db.insert(coupons).values({
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
      }).onConflictDoNothing();
    }
  } catch (err) {
    console.error("Error auto-seeding coupons table:", err);
  }
}

export async function getActiveCoupons(options?: { cartOnly?: boolean }): Promise<CouponData[]> {
  const cartOnly = options?.cartOnly ?? false;
  try {
    ensureCouponsSeeded().catch(() => {});
    const whereClause = cartOnly
      ? and(eq(coupons.active, true), eq(coupons.displayInCart, true))
      : eq(coupons.active, true);

    const rows = await db.select().from(coupons).where(whereClause);
    const dbCoupons = rows.map(transformCoupon);
    const missingStatic = couponsData.filter(
      (sc) => !dbCoupons.some((dbc) => dbc.code.toUpperCase() === sc.code.toUpperCase())
    );
    const combined = [...dbCoupons, ...missingStatic];
    return withHiddenSpecialCoupon(combined.filter((c) => !cartOnly || c.displayInCart), cartOnly);
  } catch (error) {
    console.error("Error loading coupons from DB:", error);
    return withHiddenSpecialCoupon(couponsData.filter((c) => !cartOnly || c.displayInCart), cartOnly);
  }
}

export async function getCouponByCode(code: string): Promise<CouponData | null> {
  const normalized = code.trim().toUpperCase();
  try {
    ensureCouponsSeeded().catch(() => {});
    const [row] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, normalized), eq(coupons.active, true)))
      .limit(1);
    if (row) return transformCoupon(row);
  } catch (error) {
    console.error(`Error loading coupon ${code} from DB:`, error);
  }

  const fallback = couponsData.find((c) => c.code.toUpperCase() === normalized && c.active);
  if (fallback) return fallback;

  return null;
}
