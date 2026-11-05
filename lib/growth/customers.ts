import {retryGrowthRead} from "./read-retry";
import "server-only";
import { sql } from "drizzle-orm";
import { query } from "./store";
export type CustomerStats = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  first_seen: string;
  last_activity: string | null;
  last_login: string | null;
  first_order: string | null;
  last_order: string | null;
  orders: number;
  paid_orders: number;
  spend: number;
  aov: number;
  drafts: number;
  available_coins: number;
  pending_coins: number;
  marketing_opt_in: boolean;
  last_offer: string | null;
  discovery_orders: number;
  bottle_orders: number;
};
export type CustomerFilter = {
  q?: string;
  segment?: string;
  sort?: string;
  page?: number;
  from?: string;
  to?: string;
};
export async function customerStats(filters: CustomerFilter = {}, all = false) {
  const pattern =
    "%" + (filters.q || "").trim().replace(/[\\%_]/g, "\\$&") + "%";
  const cte = sql`with refunds as (select local_order_id,sum(amount)/100.0 amount from (select local_order_id,razorpay_refund_id,max(amount) amount from razorpay_webhook_events where razorpay_refund_id is not null and (event='refund.processed' or status='processed') group by 1,2) r group by 1),
 order_base as (select o.*,growth_customer_key(o.phone,o.email) customer_key,case when o.status='refunded' then 0 else least(coalesce(o.grand_total,0),greatest(0,coalesce(o.captured_payment_amount,0)+coalesce((o.external_payment_receipt->>'amountMinor')::numeric,0)/100-coalesce(r.amount,0))) end net_paid from orders o left join refunds r on r.local_order_id=o.id),
 contacts as (select customer_key,full_name name,phone,email,city,created_at,updated_at from order_base union all select growth_customer_key(phone,email),full_name,phone,email,city,created_at,updated_at from checkout_drafts union all select growth_customer_key(phone,email),null,phone,email,null,created_at,last_used_at from customer_account_sessions union all select customer_key,name,phone,email,null,created_at,updated_at from growth_accounts union all select growth_customer_key(case when destination not like '%@%' then destination end,case when destination like '%@%' then destination end),null,case when destination not like '%@%' then destination end,case when destination like '%@%' then destination end,null,created_at,created_at from coupon_code_events where destination is not null),
 identities as (select customer_key,(array_agg(name order by updated_at desc) filter(where nullif(name,'') is not null))[1] name,(array_agg(phone order by updated_at desc) filter(where nullif(phone,'') is not null))[1] phone,(array_agg(email order by updated_at desc) filter(where nullif(email,'') is not null))[1] email,(array_agg(city order by updated_at desc) filter(where nullif(city,'') is not null))[1] city from contacts where customer_key is not null group by customer_key),
 times as (select customer_key,min(created_at) first_seen,max(updated_at) last_activity from contacts where customer_key is not null group by customer_key),
 order_stats as (select customer_key,count(*) filter(where status not in ('payment_failed','cancelled'))::int orders,count(*) filter(where net_paid>=grand_total and grand_total>0 and status not in ('refunded','cancelled','payment_failed'))::int paid_orders,coalesce(sum(net_paid),0) spend,coalesce(sum(net_paid) filter(where net_paid>=grand_total and grand_total>0 and status not in ('refunded','cancelled','payment_failed')),0) full_spend,min(created_at) first_order,max(created_at) last_order,count(*) filter(where net_paid>0 and exists(select 1 from jsonb_array_elements(cart_snapshot) i where i->>'id' like '%discovery%' or i->>'sampleSelections' is not null))::int discovery_orders,count(*) filter(where net_paid>0 and exists(select 1 from jsonb_array_elements(cart_snapshot) i where lower(i->>'size')='50ml' and coalesce((i->>'isGift')::boolean,false)=false))::int bottle_orders from order_base group by customer_key),
 logins as (select customer_key,max(last_login) last_login,max(account_activity) account_activity from (select growth_customer_key(phone,email) customer_key,coalesce(last_login_at,created_at) last_login,last_used_at account_activity from customer_account_sessions union all select customer_key,last_login_at,last_activity_at from growth_accounts) l group by customer_key),
 draft_stats as (select growth_customer_key(phone,email) customer_key,count(*) filter(where status not in ('complete','completed','converted','cancelled'))::int drafts from checkout_drafts group by 1),
 coins as (select customer_key,coalesce(sum(delta) filter(where available_at<=now() and not voided),0) balance,coalesce(sum(delta) filter(where available_at>now() and not voided),0) pending from growth_coin_ledger group by 1),
 reservations as (select customer_key,sum(coins) held from growth_coin_reservations where status='reserved' and (order_id is not null or expires_at>now()) group by 1),
 offers as (select r.customer_key,max(c.created_at) last_offer from growth_campaign_recipients r join growth_campaigns c on c.id=r.campaign_id where r.status not in ('queued','skipped') group by 1),
 customers as (select i.customer_key key,coalesce(nullif(i.name,''),i.phone,i.email,'Customer') name,i.phone,i.email,i.city,t.first_seen,l.account_activity last_activity,t.last_activity record_activity,l.last_login,s.first_order,s.last_order,coalesce(s.orders,0)::int orders,coalesce(s.paid_orders,0)::int paid_orders,coalesce(s.spend,0)::float spend,case when s.paid_orders>0 then (s.full_spend/s.paid_orders)::float else 0 end aov,coalesce(d.drafts,0)::int drafts,greatest(0,coalesce(c.balance,0)-coalesce(r.held,0))::int available_coins,greatest(0,coalesce(c.pending,0))::int pending_coins,coalesce(a.marketing_opt_in,false) marketing_opt_in,f.last_offer,coalesce(s.discovery_orders,0)::int discovery_orders,coalesce(s.bottle_orders,0)::int bottle_orders from identities i join times t on t.customer_key=i.customer_key left join order_stats s on s.customer_key=i.customer_key left join logins l on l.customer_key=i.customer_key left join draft_stats d on d.customer_key=i.customer_key left join growth_accounts a on a.customer_key=i.customer_key left join coins c on c.customer_key=i.customer_key left join reservations r on r.customer_key=i.customer_key left join offers f on f.customer_key=i.customer_key)
 `;
  const segment = filters.segment || "all";
  const where = sql`where (${pattern}='%%' or name ilike ${pattern} or phone ilike ${pattern} or email ilike ${pattern}) and (${segment}='all' or ${segment}='repeat' and paid_orders>=2 or ${segment}='first' and paid_orders=1 or ${segment}='lapsed' and last_order<now()-interval '30 days' or ${segment}='discovery' and discovery_orders>0 and bottle_orders=0 or ${segment}='abandoned' and drafts>0 or ${segment}='coins' and available_coins>0 or ${segment}='subscribed' and marketing_opt_in=true) and (${filters.from || null}::timestamptz is null or record_activity>=${filters.from || null}::timestamptz) and (${filters.to || null}::timestamptz is null or record_activity<${filters.to || null}::timestamptz+interval '1 day')`;
  const sort =
    filters.sort === "spend"
      ? sql`spend desc`
      : filters.sort === "orders"
        ? sql`paid_orders desc`
        : filters.sort === "login"
          ? sql`last_login desc nulls last`
          : sql`last_activity desc nulls last`;
  const page = Math.max(0, Math.trunc(filters.page || 0));
  const rows = await retryGrowthRead(()=>query<CustomerStats>(
    sql`${cte} select *,count(*) over()::int total_count,coalesce(sum(spend) over(),0)::float total_spend,coalesce(sum(paid_orders) over(),0)::int total_paid_orders,count(*) filter(where paid_orders>=2) over()::int repeat_customers from customers ${where} order by ${sort},key ${all ? sql`` : sql`limit 50 offset ${page * 50}`}`,
  ));
  const summary = rows[0] as
    | (CustomerStats & {
        total_spend?: number;
        total_paid_orders?: number;
        repeat_customers?: number;
      })
    | undefined;
  return {
    summary: {
      spend: summary?.total_spend || 0,
      orders: summary?.total_paid_orders || 0,
      repeat: summary?.repeat_customers || 0,
    },
    rows,
    total: Number(
      (rows[0] as CustomerStats & { total_count?: number })?.total_count || 0,
    ),
    page,
  };
}
export async function customerHistory(key: string) {
  const [orders, drafts, coupons, coins, campaigns] = await Promise.all([
    query(
      sql`select id,order_number,status,grand_total,captured_payment_amount,created_at,delivered_at,applied_coupon_code,coins_used from orders where growth_customer_key(phone,email)=${key} order by created_at desc limit 100`,
    ),
    query(
      sql`select id,status,grand_total,created_at,updated_at from checkout_drafts where growth_customer_key(phone,email)=${key} order by updated_at desc limit 50`,
    ),
    query(
      sql`select id,code,title,type,value,rules,created_at from coupons where rules->>'customerKey'=${key} order by created_at desc limit 50`,
    ),
    query(
      sql`select id,delta,kind,note,available_at,created_at,voided from growth_coin_ledger where customer_key=${key} order by created_at desc limit 100`,
    ),
    query(
      sql`select c.title,c.created_at,r.status,r.sent_at from growth_campaign_recipients r join growth_campaigns c on c.id=r.campaign_id where r.customer_key=${key} order by c.created_at desc limit 50`,
    ),
  ]);
  return { orders, drafts, coupons, coins, campaigns };
}
