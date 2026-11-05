import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import {
  growthCoupon,
  query,
  verifiedAccount,
  GrowthError,
} from "@/lib/growth/store";
export { POST } from "@/app/api/admin/coupons/route";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const rows = await query(
      sql`select id,code,title,description,type,value,min_subtotal,active,display_in_cart,welcome_back_mode,rules from coupons where active=true and archived_at is null and display_in_cart=true and coalesce(rules->>'customerKey','')='' and coalesce(rules->>'audience','all')='all' and (rules->>'expiresAt' is null or (rules->>'expiresAt')::timestamptz>now()) and (rules->>'startsAt' is null or (rules->>'startsAt')::timestamptz<=now())`,
    );
    const result: unknown[] = rows.map((row) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      description: row.description,
      type: row.type,
      value: Number(row.value),
      minSubtotal: Number(row.min_subtotal),
      active: true,
      displayInCart: true,
      welcomeBackMode:
        (row.rules as { stackable?: boolean })?.stackable === false
          ? "disable"
          : row.welcome_back_mode,
      maxDiscount: (row.rules as { maxDiscount?: number })?.maxDiscount,
    }));
    const code = request.nextUrl.searchParams.get("code");
    if (code) {
      let key: string | null = null;
      let verifiedEmail: string | null = null;
      try {
        const account = await verifiedAccount(request); key=account.key; verifiedEmail=account.verifiedEmail;
      } catch {}
      const coupon = await growthCoupon(code, key, undefined, undefined, false, verifiedEmail);
      if (coupon && !rows.some((row) => row.code === coupon.code))
        result.push({ ...coupon, active: true, displayInCart: false });
    }
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof GrowthError
            ? e.message
            : "Offers are temporarily unavailable",
      },
      { status: e instanceof GrowthError ? e.status : 503 },
    );
  }
}
