import "server-only";
import { randomUUID, randomBytes } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { findAccountSession } from "@/lib/account-login";
import {
  coinLimit,
  offerMatchesCustomer,
  couponRulesSchema,
  customerKey,
  defaultRewardSettings,
  isReversedStatus,
  rewardCoins,
  rewardSettingsSchema,
  type RewardSettings,
  type Wallet,
} from "./rules";
import type { NextRequest } from "next/server";
import type { CartItem } from "@/context/CartContext";
import type { CouponLike } from "@/lib/cart-discounts";
export type Executor = Pick<typeof db, "execute">;
export async function query<T = Record<string, unknown>>(
  q: SQL,
  executor: Executor = db,
): Promise<T[]> {
  return (await executor.execute(q)) as unknown as T[];
}
export class GrowthError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function settings(
  executor: Executor = db,
): Promise<RewardSettings> {
  const [row] = await query<{ value: unknown }>(
    sql`select value from growth_settings where id='rewards'`,
    executor,
  );
  return rewardSettingsSchema.parse(row?.value ?? defaultRewardSettings);
}
export async function verifiedAccount(request: NextRequest, token?: string) {
  const value =
    token ||
    request.headers.get("x-hume-account-token") ||
    request.cookies.get("hume_account")?.value;
  const session = value ? await findAccountSession(value) : null;
  if (!session)
    throw new GrowthError(
      "Log in with your verification code to use your coins.",
      401,
    );
  const key = customerKey(session.phone, session.email || session.identifier);
  if (!key)
    throw new GrowthError("This account needs a verified contact.", 401);
  return { key, phone: session.phone, email: session.email, name: "", session, verifiedEmail: session.identityType === "email" ? session.identifier.toLowerCase() : null };
}
export async function ensureAccount(
  key: string,
  profile: { phone?: string | null; email?: string | null; name?: string } = {},
  executor: Executor = db,
) {
  await query(
    sql`insert into growth_accounts(customer_key,phone,email,name,referral_code) values (${key},${profile.phone || null},${profile.email || null},${profile.name || ""},${"HUME" + randomBytes(5).toString("hex").toUpperCase()}) on conflict(customer_key) do nothing`,
    executor,
  );
  const [account] = await query<{
    customer_key: string;
    phone: string | null;
    email: string | null;
    name: string;
    referral_code: string;
    marketing_opt_in: boolean;
  }>(sql`select * from growth_accounts where customer_key=${key}`, executor);
  return account;
}
export async function lockWallet(key: string, executor: Executor) {
  await query(
    sql`select pg_advisory_xact_lock(hashtext('wallet:'||${key}))`,
    executor,
  );
}
export async function walletTotals(
  key: string,
  exceptReservation?: string,
  executor: Executor = db,
) {
  const [ledger] = await query<{ balance: number; pending: number }>(
    sql`select coalesce(sum(delta) filter(where available_at<=now() and not voided),0)::int balance,coalesce(sum(delta) filter(where available_at>now() and not voided),0)::int pending from growth_coin_ledger where customer_key=${key}`,
    executor,
  );
  const [held] = await query<{ reserved: number }>(
    sql`select coalesce(sum(coins),0)::int reserved from growth_coin_reservations where customer_key=${key} and status='reserved' and (order_id is not null or expires_at>now()) and (${exceptReservation || null}::uuid is null or id<>${exceptReservation || null}::uuid)`,
    executor,
  );
  return {
    balance: Number(ledger.balance),
    pending: Math.max(0, Number(ledger.pending)),
    reserved: Number(held.reserved),
    available: Math.max(0, Number(ledger.balance) - Number(held.reserved)),
  };
}
export async function reconcileCustomer(key: string) {
  const config = await settings();
  await ensureAccount(key);
  const orderRows = await query<{
    id: string;
    status: string;
    grand_total: string;
    shipping_fee: string;
    cod_fee: string;
    captured_payment_amount: string | null;
    external_payment_receipt: { amountMinor?: number } | null;
    delivered_at: string | null;
    created_at: string;
    coins_used: number;
    coin_customer_key: string | null;
  }>(
    sql`select id,status,grand_total,shipping_fee,cod_fee,captured_payment_amount,external_payment_receipt,delivered_at,created_at,coins_used,coin_customer_key from orders where coin_customer_key=${key} or (coin_customer_key is null and growth_customer_key(phone,email)=${key}) order by created_at`,
  );
  await db.transaction(async (tx) => {
    await lockWallet(key, tx);
    for (const order of orderRows) {
      const cash = Number(order.grand_total || 0),
        received =
          Number(order.captured_payment_amount || 0) +
          Number(order.external_payment_receipt?.amountMinor || 0) / 100;
      const reversed = isReversedStatus(order.status),
        cancelled = /cancel/i.test(order.status),
        fullyPaid = cash > 0 && received >= cash - 0.005;
      if (order.coins_used > 0) {
        const [r] = await query<{ id: string; coins: number; status: string }>(
          sql`select * from growth_coin_reservations where order_id=${order.id} and customer_key=${key} for update`,
          tx,
        );
        if (r?.status === "reserved" && cancelled)
          await query(
            sql`update growth_coin_reservations set status='released',updated_at=now() where id=${r.id}::uuid`,
            tx,
          );
        else if (r?.status === "reserved" && received > 0) {
          await query(
            sql`insert into growth_coin_ledger(id,customer_key,delta,source,order_id,kind,note) values (${randomUUID()}::uuid,${key},${-r.coins},${"spend:" + order.id},${order.id},'spend','Coins used on order') on conflict(source) do nothing`,
            tx,
          );
          await query(
            sql`update growth_coin_reservations set status='spent',updated_at=now() where id=${r.id}::uuid`,
            tx,
          );
        }
        if ((r?.status === "spent" || (r?.status === "reserved" && received > 0 && !cancelled)) && reversed) {
          const [refund] = await query<{ amount: number }>(
            sql`select coalesce(sum(amount),0)/100.0 as amount from (select razorpay_refund_id,max(amount) amount from razorpay_webhook_events where local_order_id=${order.id} and razorpay_refund_id is not null and (event='refund.processed' or status='processed') group by razorpay_refund_id) r`,
            tx,
          );
          const target =
            cancelled || order.status === "refunded"
              ? r.coins
              : Math.min(
                  r.coins,
                  Math.floor(
                    (r.coins * Number(refund?.amount || 0)) / Math.max(1, cash),
                  ),
                );
          const [restored] = await query<{ n: number }>(
            sql`select coalesce(sum(delta),0)::int n from growth_coin_ledger where customer_key=${key} and order_id=${order.id} and kind='restore'`,
            tx,
          );
          if (target > Number(restored.n))
            await query(
              sql`insert into growth_coin_ledger(id,customer_key,delta,source,order_id,kind,note) values (${randomUUID()}::uuid,${key},${target - Number(restored.n)},${"restore:" + order.id + ":" + target},${order.id},'restore','Coins returned after cancellation or verified refund') on conflict(source) do nothing`,
              tx,
            );
        }
      }
      const source = "earn:" + order.id;
      if (
        reversed ||
        !["delivered", "complete"].includes(order.status) ||
        !fullyPaid
      ) {
        if (reversed)
          await query(
            sql`update growth_coin_ledger set voided=true where source=${source}`,
            tx,
          );
      } else if (
        config.earningEnabled &&
        config.earnFrom &&
        new Date(order.created_at) >= new Date(config.earnFrom)
      ) {
        const coins = rewardCoins(
          Math.max(
            0,
            cash - Number(order.shipping_fee || 0) - Number(order.cod_fee || 0),
          ),
          config.earnPercent,
        );
        if (coins > 0) {
          const available = new Date(
            new Date(order.delivered_at || order.created_at).getTime() +
              config.holdDays * 86400000,
          ).toISOString();
          await query(
            sql`insert into growth_coin_ledger(id,customer_key,delta,source,order_id,kind,note,available_at) values (${randomUUID()}::uuid,${key},${coins},${source},${order.id},'earn','Reward for a delivered, fully paid order',${available}::timestamptz) on conflict(source) do nothing`,
            tx,
          );
        }
      }
      const refs = await query<{
        id: string;
        referrer_key: string;
        coins: number;
      }>(
        sql`select id,referrer_key,coins from growth_referrals where order_id=${order.id}`,
        tx,
      );
      for (const ref of refs) {
        if (reversed) {
          await query(
            sql`update growth_coin_ledger set voided=true where source=${"referral:" + ref.id}`,
            tx,
          );
          await query(
            sql`update growth_referrals set status='reversed' where id=${ref.id}::uuid`,
            tx,
          );
        } else if (
          fullyPaid &&
          ["delivered", "complete"].includes(order.status)
        ) {
          const available = new Date(
            new Date(order.delivered_at || order.created_at).getTime() +
              config.holdDays * 86400000,
          ).toISOString();
          await query(
            sql`insert into growth_coin_ledger(id,customer_key,delta,source,order_id,kind,note,available_at) values (${randomUUID()}::uuid,${ref.referrer_key},${ref.coins},${"referral:" + ref.id},${order.id},'referral','Reward for a referred customer’s delivered order',${available}::timestamptz) on conflict(source) do nothing`,
            tx,
          );
          await query(
            sql`update growth_referrals set status=${new Date(available) <= new Date() ? "earned" : "pending"} where id=${ref.id}::uuid`,
            tx,
          );
        }
      }
      if (cancelled || (order.status === "payment_failed" && received === 0))
        await query(
          sql`update growth_coupon_uses set status='released' where order_id=${order.id}`,
          tx,
        );
      else if (received > 0)
        await query(
          sql`update growth_coupon_uses set status='redeemed' where order_id=${order.id}`,
          tx,
        );
    }
  });
}
export async function readWallet(key: string): Promise<Wallet> {
  await reconcileCustomer(key);
  const account = await ensureAccount(key);
  const totals = await walletTotals(key);
  const history = await query<Wallet["history"][number]>(
    sql`select id,delta,kind,note,available_at,created_at,voided from growth_coin_ledger where customer_key=${key} order by created_at desc limit 100`,
  );
  const referrals = await query<{
    status: string;
    coins: number;
    created_at: string;
  }>(
    sql`select status,coins,created_at from growth_referrals where referrer_key=${key} order by created_at desc limit 100`,
  );
  return {
    ...totals,
    referralCode: account.referral_code,
    marketingOptIn: account.marketing_opt_in,
    history,
    settings: await settings(),
    referrals,
  };
}
export async function reserveCoins(
  executor: Executor,
  key: string,
  id: string,
  requested: number,
  net: number,
  percent: number,
  orderId?: string,
  revision = 0,
) {
  await ensureAccount(key, {}, executor);
  await lockWallet(key, executor);
  const [existing] = await query<{
    customer_key: string;
    order_id: string | null;
    status: string;
    coins: number;
    expires_at: string;
    revision: number;
  }>(
    sql`select * from growth_coin_reservations where id=${id}::uuid for update`,
    executor,
  );
  if (!orderId && existing && Number(existing.revision) > revision)
    throw new GrowthError(
      "A newer cart total is being calculated. Please retry.",
      409,
    );
  if (existing && existing.customer_key !== key)
    throw new GrowthError("Refresh your bag after changing accounts.", 409);
  if (existing?.order_id && existing.order_id !== orderId)
    throw new GrowthError(
      "These coins belong to a saved order. Resume or cancel that order first.",
      409,
    );
  if (
    orderId &&
    (!existing ||
      (!existing.order_id && new Date(existing.expires_at) <= new Date()) ||
      existing.status !== "reserved" ||
      Number(existing.coins) !== requested)
  )
    throw new GrowthError(
      "Your coin selection expired. Reopen the bag to select coins again.",
      409,
    );
  const totals = await walletTotals(key, id, executor),
    max = coinLimit(net, totals.available, percent),
    coins = Math.min(Math.max(0, requested), max);
  if (orderId && coins !== requested)
    throw new GrowthError(
      "Your available coin balance changed. Reopen the bag to review it.",
      409,
    );
  if (!existing?.order_id)
    await query(
      sql`insert into growth_coin_reservations(id,customer_key,coins,order_id,status,expires_at,revision) values (${id}::uuid,${key},${coins},${orderId || null},${coins ? "reserved" : "released"},now()+interval '30 minutes',${revision}) on conflict(id) do update set coins=excluded.coins,order_id=excluded.order_id,status=excluded.status,expires_at=excluded.expires_at,revision=excluded.revision,updated_at=now()`,
      executor,
    );
  return { coins, max, available: totals.available };
}
export async function hasPaidOrder(key: string, executor: Executor = db) {
  const [row] = await query<{ n: number }>(
    sql`select count(*)::int n from orders where growth_customer_key(phone,email)=${key} and coalesce(captured_payment_amount,0)+coalesce((external_payment_receipt->>'amountMinor')::numeric,0)/100>0 and status not in ('cancelled','refunded')`,
    executor,
  );
  return row.n > 0;
}
export async function growthCoupon(
  code: string,
  key: string | null,
  cart?: CartItem[],
  executor: Executor = db,
  lock = false,
  verifiedEmail?: string | null,
): Promise<
  | (CouponLike & {
      id: string;
      rules: ReturnType<typeof couponRulesSchema.parse>;
      eligibleProductIds?: string[];
    })
  | null
> {
  if (!code) return null;
  const [row] = await query<{
    id: string;
    code: string;
    description: string;
    type: string;
    value: string;
    min_subtotal: string;
    active: boolean;
    archived_at: string | null;
    welcome_back_mode: string;
    rules: unknown;
  }>(
    lock
      ? sql`select * from coupons where code=${code.trim().toUpperCase()} for update`
      : sql`select * from coupons where code=${code.trim().toUpperCase()}`,
    executor,
  );
  if (!row || !row.active || row.archived_at)
    throw new GrowthError("This coupon is not available.");
  const rules = couponRulesSchema.parse(row.rules || {}),
    now = Date.now();
  if (
    (rules.startsAt && new Date(rules.startsAt).getTime() > now) ||
    (rules.expiresAt && new Date(rules.expiresAt).getTime() <= now)
  )
    throw new GrowthError("This offer has expired or has not started yet.");
  if (!offerMatchesCustomer(rules.customerKey,key,verifiedEmail))
    throw new GrowthError(
      "Log in to the customer account this offer was issued to.",
      401,
    );
  if ((rules.perCustomer || rules.audience !== "all") && !key)
    throw new GrowthError("Log in to use this customer offer.", 401);
  if (key && rules.audience !== "all") {
    const returning = await hasPaidOrder(key, executor);
    if (
      (rules.audience === "first" && returning) ||
      (rules.audience === "returning" && !returning)
    )
      throw new GrowthError("This offer is not eligible for your account.");
  }
  const [usage] = await query<{ total: number; personal: number }>(
    sql`select count(*) filter(where status<>'released')::int total,count(*) filter(where status<>'released' and customer_key=${key})::int personal from growth_coupon_uses where coupon_id=${row.id}`,
    executor,
  );
  if (
    (rules.maxUses && usage.total >= rules.maxUses) ||
    (rules.perCustomer && usage.personal >= rules.perCustomer)
  )
    throw new GrowthError("This coupon has reached its usage limit.");
  let eligible: string[] | undefined;
  if (rules.productIds.length || rules.categoryIds.length) {
    const mapping = rules.categoryIds.length
      ? await query<{ id: string }>(
          sql`select distinct p.id from products p left join product_categories c on c.product_id=p.id where p.category_id in (${sql.join(
            rules.categoryIds.map((id) => sql`${id}`),
            sql`,`,
          )}) or c.category_id in (${sql.join(
            rules.categoryIds.map((id) => sql`${id}`),
            sql`,`,
          )})`,
          executor,
        )
      : [];
    eligible = [...new Set([...rules.productIds, ...mapping.map((p) => p.id)])];
    if (cart && !cart.some((p) => !p.isGift && eligible!.includes(p.id)))
      throw new GrowthError(
        "This coupon does not apply to the products in your bag.",
      );
  }
  if (
    cart &&
    cart
      .filter((p) => !p.isGift)
      .reduce((n, p) => n + p.price * p.quantity, 0) < Number(row.min_subtotal)
  )
    throw new GrowthError(
      `This coupon requires a minimum spend of ₹${row.min_subtotal}.`,
    );
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type: row.type,
    value: Number(row.value),
    minSubtotal: Number(row.min_subtotal),
    welcomeBackMode:
      (row.rules as { stackable?: boolean })?.stackable === false
        ? "disable"
        : row.welcome_back_mode,
    rules,
    eligibleProductIds: eligible,
    maxDiscount: rules.maxDiscount ?? undefined,
  };
}
export async function referralOffer(
  code: string | undefined,
  key: string | null,
  subtotal: number,
  executor: Executor = db,
) {
  const config = await settings(executor);
  if (
    !config.referralsEnabled ||
    !code ||
    !key ||
    subtotal < config.referralMinSubtotal
  )
    return null;
  const [referrer] = await query<{ customer_key: string }>(
    sql`select customer_key from growth_accounts where referral_code=${code}`,
    executor,
  );
  if (
    !referrer ||
    referrer.customer_key === key ||
    (await hasPaidOrder(key, executor))
  )
    return null;
  const [previous] = await query(
    sql`select id from growth_referrals where referred_key=${key}`,
    executor,
  );
  if (previous) return null;
  return {
    referrer: referrer.customer_key,
    discount: config.friendDiscount,
    coins: config.referralCoins,
  };
}
