import {readBoundedJson} from "@/lib/bounded-request-body";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { z } from "zod";
import { canonicalCart, CheckoutRequestError } from "@/lib/secure-checkout";
import { priceSecureCart } from "@/lib/secure-checkout-pricing";
import {
  normalizeAdminControls,
  ADMIN_CONTROLS_KEY,
} from "@/lib/admin-settings";
import {
  readVisitReward,
  VISIT_REWARD_COOKIE,
} from "@/lib/server-visit-reward";
import { checkoutSigningSecret } from "@/lib/checkout-signing-secret";
import {
  GrowthError,
  growthCoupon,
  query,
  referralOffer,
  reserveCoins,
  reconcileCustomer,
  settings,
  verifiedAccount,
} from "@/lib/growth/store";
const bodySchema = z.object({
  revision: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER)
    .default(0),
  items: z.unknown(),
  couponCode: z.string().max(100).optional(),
  coins: z.number().int().min(0).max(100000).default(0),
  reservationId: z.string().uuid(),
  welcomePercent: z
    .union([z.literal(0), z.literal(5), z.literal(10)])
    .default(0),
});
export async function POST(req: NextRequest) {
  try {
    if (
      req.headers.get("origin") &&
      req.headers.get("origin") !== req.nextUrl.origin
    )
      throw new GrowthError("Invalid origin", 403);
    const body = bodySchema.parse(await readBoundedJson(req,64000)),
      cart = await canonicalCart(body.items);
    let account: Awaited<ReturnType<typeof verifiedAccount>> | null = null;
    if (
      req.headers.get("x-hume-account-token") ||
      req.cookies.get("hume_account")
    ) {
      try {
        account = await verifiedAccount(req);
      } catch (e) {
        if (body.coins > 0) throw e;
      }
    }
    if (body.coins > 0 && !account)
      throw new GrowthError("Log in to redeem your coins.", 401);
    if (account) await reconcileCustomer(account.key);
    const coupon = await growthCoupon(
      body.couponCode || "",
      account?.key || null,
      cart, db, false, account?.verifiedEmail,
    );
    const [config] = await query<{ value: unknown }>(
      sql`select value from site_settings where key=${ADMIN_CONTROLS_KEY}`,
    );
    const reward = readVisitReward(
      req.cookies.get(VISIT_REWARD_COOKIE)?.value,
      checkoutSigningSecret(),
    );
    const welcome = Math.min(body.welcomePercent, reward?.tier || 0) as
      0 | 5 | 10;
    const quote = priceSecureCart(
      cart,
      coupon,
      welcome,
      normalizeAdminControls(config?.value),
    );
    const referral =
      coupon || quote.welcomeDiscount > 0
        ? null
        : await referralOffer(
            req.cookies.get("hume_referral")?.value,
            account?.key || null,
            quote.subtotal,
          );
    const referralDiscount = Math.min(
      referral?.discount || 0,
      Math.max(0, quote.grandTotal - quote.shippingFee - 1),
    );
    const net = Math.max(
      0,
      quote.grandTotal - quote.shippingFee - referralDiscount,
    );
    const policy = await settings();
    const reservation = account
      ? await db.transaction((tx) =>
          reserveCoins(
            tx,
            account!.key,
            body.reservationId,
            body.coins,
            net,
            policy.maxRedeemPercent,
            undefined,
            body.revision,
          ),
        )
      : { coins: 0, max: 0, available: 0 };
    return NextResponse.json(
      {
        ...quote,
        grandTotal:
          Math.round(
            (quote.grandTotal - reservation.coins - referralDiscount) * 100,
          ) / 100,
        coins: reservation.coins,
        referralDiscount,
        reservationId: body.reservationId,
        walletAvailable: reservation.available,
        maxCoins: reservation.max,
        freeSample:
          coupon?.type === "free_sample" ? coupon.rules.sampleProductId : null,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error:
          (e instanceof GrowthError || e instanceof CheckoutRequestError)
            ? e.message
            : "Could not refresh the offer total. Please retry.",
      },
      {
        status:
          (e instanceof GrowthError || e instanceof CheckoutRequestError)
            ? e.status
            : e instanceof z.ZodError
              ? 400
              : 503,
      },
    );
  }
}
