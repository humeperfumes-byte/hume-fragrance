import {classifySafeFailure} from "@/lib/safe-error-monitoring";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { requireAdminToken } from "@/lib/admin-auth";
import { readBoundedJson } from "@/lib/bounded-request-body";
import { customerStats, customerHistory } from "@/lib/growth/customers";
import {
  GrowthError,
  query,
  ensureAccount,
  readWallet,
  lockWallet,
  walletTotals,
  settings,
} from "@/lib/growth/store";
import {
  couponRulesSchema,
  csvCell,
  rewardSettingsSchema,
} from "@/lib/growth/rules";
import {
  createCampaign,
  previewCampaign,
  processCampaigns,
  whatsappStatus,
} from "@/lib/growth/campaigns";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
function auth(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  if (
    req.method !== "GET" &&
    req.headers.get("origin") &&
    req.headers.get("origin") !== req.nextUrl.origin
  )
    return json({ error: "Invalid origin" }, 403);
  return null;
}
const keySchema = z
  .string()
  .min(7)
  .max(330)
  .regex(/^(phone:|email:)/);
const filtersSchema = z.object({
  q: z.string().max(100).optional(),
  segment: z
    .enum([
      "all",
      "repeat",
      "first",
      "lapsed",
      "discovery",
      "abandoned",
      "coins",
      "subscribed",
    ])
    .optional(),
  sort: z.enum(["activity", "spend", "orders", "login"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().nonnegative().max(100000).optional(),
});
export async function GET(req: NextRequest) {
  const denied = auth(req);
  if (denied) return denied;
  try {
    const resource = req.nextUrl.searchParams.get("resource") || "customers";
    if (resource === "customers") {
      const filter = filtersSchema.parse({
        q: req.nextUrl.searchParams.get("q") || undefined,
        segment: req.nextUrl.searchParams.get("segment") || undefined,
        sort: req.nextUrl.searchParams.get("sort") || undefined,
        from: req.nextUrl.searchParams.get("from") || undefined,
        to: req.nextUrl.searchParams.get("to") || undefined,
        page: Number(req.nextUrl.searchParams.get("page") || 0),
      });
      const data = await customerStats(
        filter,
        req.nextUrl.searchParams.get("format") === "csv",
      );
      if (req.nextUrl.searchParams.get("format") === "csv") {
        const columns = [
          "name",
          "phone",
          "email",
          "orders",
          "paid_orders",
          "spend",
          "aov",
          "first_order",
          "last_order",
          "last_login",
          "last_activity",
          "available_coins",
          "pending_coins",
          "marketing_opt_in",
        ] as const;
        return new NextResponse(
          [
            columns.join(","),
            ...data.rows.map((row) =>
              columns.map((c) => csvCell(row[c])).join(","),
            ),
          ].join("\r\n"),
          {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition":
                'attachment; filename="hume-customers.csv"',
              "Cache-Control": "private, no-store",
            },
          },
        );
      }
      return json(data);
    }
    if (resource === "history") {
      const key = keySchema.parse(req.nextUrl.searchParams.get("key"));
      return json({
        ...(await customerHistory(key)),
        wallet: await readWallet(key),
      });
    }
    if (resource === "campaign") {
      const id = z.string().uuid().parse(req.nextUrl.searchParams.get("id"));
      return json({
        recipients: await query(
          sql`select customer_key,name,phone,status,error_code,sent_at,updated_at from growth_campaign_recipients where campaign_id=${id}::uuid order by updated_at desc`,
        ),
      });
    }
    const [config, campaigns, coupons, segments, products, categories] =
      await Promise.all([
        settings(),
        query(
          sql`select c.*,count(r.id)::int recipients,count(r.id) filter(where r.status in ('accepted','sent','delivered','read'))::int accepted,count(r.id) filter(where r.status in ('delivered','read'))::int delivered,count(r.id) filter(where r.status='read')::int read,count(r.id) filter(where r.status in ('failed','unknown'))::int failed from growth_campaigns c left join growth_campaign_recipients r on r.campaign_id=c.id group by c.id order by c.created_at desc limit 100`,
        ),
        query(
          sql`select c.id,c.code,c.title,c.type,c.value,c.min_subtotal,c.active,c.rules,c.archived_at,c.created_at,count(u.order_id) filter(where u.status='redeemed')::int redemptions from coupons c left join growth_coupon_uses u on u.coupon_id=c.id group by c.id order by c.created_at desc`,
        ),
        query(
          sql`select * from growth_saved_segments order by created_at desc`,
        ),
        query(sql`select id,name,category_id from products order by name`),
        query(
          sql`select id,name from catalog_categories order by sort_order,name`,
        ),
      ]);
    return json({
      settings: config,
      whatsapp: whatsappStatus(),
      campaigns,
      coupons,
      segments,
      products,
      categories,
    });
  } catch (e) {
    return json(
      {
        diagnostic: classifySafeFailure(e),
        error:
          e instanceof GrowthError
            ? e.message
            : e instanceof z.ZodError
              ? e.errors[0]?.message
              : "Customer tools are temporarily unavailable. Check database connectivity and the growth migration.",
      },
      e instanceof GrowthError ? e.status : e instanceof z.ZodError ? 400 : 503,
    );
  }
}
export async function POST(req: NextRequest) {
  const denied = auth(req);
  if (denied) return denied;
  try {
    const body = (await readBoundedJson(req, 500000)) as Record<
      string,
      unknown
    >;
    const action = z.string().parse(body.action);
    if (action === "quickOffer") {
      const input = z
        .object({
          type: z.enum(["fixed", "percent", "free_shipping", "free_sample"]),
          value: z.number().min(0).max(100000).default(0),
          minSubtotal: z.number().min(0).max(1000000).default(0),
          title: z.string().trim().max(120).optional(),
          code: z
            .string()
            .trim()
            .min(3)
            .max(32)
            .regex(/^[A-Za-z0-9_-]+$/)
            .optional(),
          rules: couponRulesSchema,
        })
        .parse(body);
      if (
        (input.type === "percent" && (input.value <= 0 || input.value > 100)) ||
        (input.type === "fixed" && input.value <= 0)
      )
        throw new GrowthError("Enter a valid discount amount.");
      if (input.type === "free_sample" && !input.rules.sampleProductId)
        throw new GrowthError("Choose the free sample.");
      const id = "coupon-" + randomUUID(),
        code = (
          input.code || "HUME-" + randomBytes(3).toString("hex")
        ).toUpperCase();
      const title =
        input.title ||
        (input.type === "fixed"
          ? `₹${input.value} off`
          : input.type === "percent"
            ? `${input.value}% off`
            : input.type === "free_shipping"
              ? "Free delivery"
              : "Complimentary sample");
      if (input.rules.customerKey) {
        const row = (await customerStats({}, true)).rows.find(
          (c) => c.key === input.rules.customerKey,
        );
        if (!row) throw new GrowthError("Customer not found.");
        await ensureAccount(row.key, {
          phone: row.phone,
          email: row.email,
          name: row.name,
        });
      }
      const [created] = await query(
        sql`insert into coupons(id,code,title,description,type,value,min_subtotal,active,display_in_cart,welcome_back_mode,rules) values (${id},${code},${title},${title},${input.type},${input.value},${input.minSubtotal},true,false,${input.rules.stackable ? "cap_5" : "disable"},${JSON.stringify(input.rules)}::jsonb) on conflict do nothing returning id`,
      );
      if (!created)
        throw new GrowthError(
          "That code already exists. Choose another code.",
          409,
        );
      const link =
        "https://www.humefragrance.com/shop?offer=" + encodeURIComponent(code);
      const expiry = input.rules.expiresAt
        ? new Date(input.rules.expiresAt).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          })
        : "No expiry";
      const message = `Your HUME offer: ${title}${input.minSubtotal ? ` on orders above ₹${input.minSubtotal}` : ""}. Use ${code}. Valid until ${expiry} IST. ${link}`;
      return json({ id, code, link, message }, 201);
    }
    if (action === "couponStatus") {
      const input = z
        .object({ id: z.string().max(255), active: z.boolean() })
        .parse(body);
      await query(
        sql`update coupons set active=${input.active},archived_at=case when ${input.active} then null else now() end,updated_at=now() where id=${input.id}`,
      );
      return json({ ok: true });
    }
    if (action === "settings") {
      const input = rewardSettingsSchema.parse(body.settings);
      const previous = await settings();
      const value = {
        ...input,
        earnFrom:
          input.earningEnabled && !previous.earningEnabled
            ? new Date().toISOString()
            : previous.earnFrom,
      };
      await query(
        sql`update growth_settings set value=${JSON.stringify(value)}::jsonb,updated_at=now() where id='rewards'`,
      );
      return json({ settings: value });
    }
    if (action === "grantCoins") {
      const input = z
        .object({
          key: keySchema,
          coins: z
            .number()
            .int()
            .min(-10000)
            .max(10000)
            .refine((n) => n !== 0),
          note: z.string().trim().min(5).max(500),
          requestId: z.string().uuid(),
        })
        .parse(body);
      await ensureAccount(input.key);
      await db.transaction(async (tx) => {
        await lockWallet(input.key, tx);
        const balance = await walletTotals(input.key, undefined, tx);
        if (input.coins < 0 && balance.available < -input.coins)
          throw new GrowthError(
            "This adjustment would spend reserved or unavailable coins.",
          );
        await query(
          sql`insert into growth_coin_ledger(id,customer_key,delta,source,kind,note) values (${randomUUID()}::uuid,${input.key},${input.coins},${"admin:" + input.requestId},'adjustment',${input.note}) on conflict(source) do nothing`,
          tx,
        );
      });
      return json({ ok: true });
    }
    if (action === "consent") {
      const input = z
        .object({
          key: keySchema,
          subscribed: z.boolean(),
          evidence: z.string().trim().min(5).max(500),
        })
        .parse(body);
      const row = (await customerStats({}, true)).rows.find(
        (c) => c.key === input.key,
      );
      if (!row) throw new GrowthError("Customer not found.");
      await ensureAccount(row.key, {
        phone: row.phone,
        email: row.email,
        name: row.name,
      });
      await query(
        sql`update growth_accounts set marketing_opt_in=${input.subscribed},consent_source=${"admin_recorded: " + input.evidence},consent_at=now(),updated_at=now() where customer_key=${input.key}`,
      );
      return json({ ok: true });
    }
    if (action === "saveSegment") {
      const input = z
        .object({
          name: z.string().trim().min(1).max(100),
          filters: filtersSchema,
        })
        .parse(body);
      await query(
        sql`insert into growth_saved_segments(id,name,filters) values (${randomUUID()}::uuid,${input.name},${JSON.stringify(input.filters)}::jsonb)`,
      );
      return json({ ok: true });
    }
    if (action === "previewCampaign") {
      const input = z
        .object({ keys: z.array(keySchema).max(10000) })
        .parse(body);
      return json(await previewCampaign(input.keys));
    }
    if (action === "createCampaign") {
      const input = z
        .object({
          title: z.string().trim().min(1).max(150),
          body: z.string().trim().min(1).max(950),
          link: z
            .string()
            .url()
            .max(2048)
            .refine((v) => /^https:\/\//i.test(v), "Use an HTTPS offer link"),
          keys: z.array(keySchema).min(1).max(10000),
          scheduledAt: z.string().datetime().optional(),
        })
        .parse(body);
      return json(await createCampaign(input), 201);
    }
    if (
      action === "queueCampaign" ||
      action === "cancelCampaign" ||
      action === "runCampaign"
    ) {
      const input = z.object({ id: z.string().uuid() }).parse(body);
      if (action === "cancelCampaign") {
        await query(
          sql`update growth_campaigns set status='cancelled',updated_at=now() where id=${input.id}::uuid and status<>'completed'`,
        );
        await query(
          sql`update growth_campaign_recipients set status='skipped',error_code='cancelled' where campaign_id=${input.id}::uuid and status='queued'`,
        );
        return json({ ok: true });
      }
      if (action === "runCampaign")
        return json(await processCampaigns(input.id));
      const config = whatsappStatus();
      if (!config.canSend)
        throw new GrowthError(
          config.localSendingDisabled
            ? "Local WhatsApp sending is disabled. You can save and inspect drafts."
            : "Connect WhatsApp and an approved marketing template before sending.",
          409,
        );
      await query(
        sql`update growth_campaigns set status=case when scheduled_at>now() then 'scheduled' else 'running' end,template_name=${config.templateName},language=${config.language},updated_at=now() where id=${input.id}::uuid and status='draft'`,
      );
      return json({ ok: true });
    }
    throw new GrowthError("Unknown action.");
  } catch (e) {
    return json(
      {
        error:
          e instanceof GrowthError
            ? e.message
            : e instanceof z.ZodError
              ? e.errors[0]?.message
              : "Could not save. Refresh the current status before retrying.",
      },
      e instanceof GrowthError ? e.status : e instanceof z.ZodError ? 400 : 503,
    );
  }
}
