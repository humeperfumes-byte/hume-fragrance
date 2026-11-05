import { db } from "@/db";
import { coupons } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import type { CouponData } from "@/data/coupons";
function transform(row: typeof coupons.$inferSelect): CouponData {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    description: row.description,
    type: row.type,
    value: Number(row.value),
    minSubtotal: Number(row.minSubtotal),
    active: row.active,
    displayInCart: row.displayInCart,
    welcomeBackMode:
      row.welcomeBackMode === "allow"
        ? "allow"
        : row.welcomeBackMode === "disable"
          ? "disable"
          : "cap_5",
  };
}
export async function getActiveCoupons(options?: {
  cartOnly?: boolean;
}): Promise<CouponData[]> {
  const rows = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.active, true), isNull(coupons.archivedAt)));
  return rows
    .filter(
      (c) =>
        (!options?.cartOnly || c.displayInCart) &&
        !c.rules?.customerKey &&
        (!c.rules?.expiresAt || new Date(c.rules.expiresAt) > new Date()) &&
        (!c.rules?.startsAt || new Date(c.rules.startsAt) <= new Date()),
    )
    .map(transform);
}
export async function getCouponByCode(
  code: string,
): Promise<CouponData | null> {
  const [row] = await db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.code, code.trim().toUpperCase()),
        eq(coupons.active, true),
        isNull(coupons.archivedAt),
      ),
    )
    .limit(1);
  if (
    !row ||
    row.rules?.customerKey ||
    (row.rules?.expiresAt && new Date(row.rules.expiresAt) <= new Date())
  )
    return null;
  return transform(row);
}
