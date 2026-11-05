import {campaignAudience,type CampaignContact} from "./audience";
import {retryGrowthRead} from "./read-retry";
import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { query, GrowthError, reconcileCustomer } from "./store";
export function whatsappStatus() {
  const required = [
    "WHATSAPP_CLOUD_ACCESS_TOKEN",
    "WHATSAPP_CLOUD_PHONE_NUMBER_ID",
    "WHATSAPP_CLOUD_API_VERSION",
    "WHATSAPP_MARKETING_TEMPLATE_NAME",
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());
  const local =
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_LOCAL_CUSTOMER_NOTIFICATIONS !== "true";
  return {
    configured: !missing.length,
    canSend: !missing.length && !local,
    missing,
    localSendingDisabled: local,
    templateName: process.env.WHATSAPP_MARKETING_TEMPLATE_NAME || "",
    language: process.env.WHATSAPP_MARKETING_TEMPLATE_LANGUAGE || "en",
    webhookConfigured: Boolean(
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
      process.env.WHATSAPP_APP_SECRET,
    ),
  };
}
type Recipient = {
  id: string;
  campaign_id: string;
  customer_key: string;
  phone: string;
  name: string;
  title: string;
  body: string;
  link: string;
  template_name: string;
  language: string;
};
export async function processCampaigns(
  campaignId?: string,
  send: typeof fetch = fetch,
) {
  const config = whatsappStatus();
  if (!config.canSend)
    throw new GrowthError(
      config.localSendingDisabled
        ? "WhatsApp delivery is disabled locally. Drafts and previews are available."
        : "Configure the WhatsApp Cloud API and approved marketing template before sending.",
      409,
    );
  const version = process.env.WHATSAPP_CLOUD_API_VERSION!;
  if (!/^v\d+\.\d+$/.test(version))
    throw new GrowthError("Invalid WhatsApp API version configuration.", 503);
  // An interrupted provider request can have succeeded. Never automatically resend it.
  await query(
    sql`update growth_campaign_recipients set status='unknown',error_code='delivery_outcome_unknown',updated_at=now() where status='sending' and claimed_at<now()-interval '15 minutes'`,
  );
  let accepted = 0, failed = 0, skipped = 0, processed = 0;
  const started = Date.now();
  for (let index=0; index<20 && Date.now()-started<40000; index++) {
    const claimed = await db.transaction(async (tx) =>
    query<Recipient>(
      sql`with picked as (select r.id from growth_campaign_recipients r join growth_campaigns c on c.id=r.campaign_id where r.status='queued' and c.status in ('scheduled','running') and (c.scheduled_at is null or c.scheduled_at<=now()) and (${campaignId || null}::uuid is null or c.id=${campaignId || null}::uuid) order by c.created_at,r.id for update of r skip locked limit 1), updated as (update growth_campaign_recipients r set status='sending',claimed_at=now(),updated_at=now() from picked where r.id=picked.id returning r.*) select u.*,c.title,c.body,c.link,c.template_name,c.language from updated u join growth_campaigns c on c.id=u.campaign_id`,
      tx,
    ),
  );
    const r = claimed[0];
    if (!r) break;
    processed++;
    const [consent] = await query<{ marketing_opt_in: boolean }>(
      sql`select marketing_opt_in from growth_accounts where customer_key=${r.customer_key}`,
    );
    const [campaign] = await query<{ status: string }>(
      sql`select status from growth_campaigns where id=${r.campaign_id}::uuid`,
    );
    if (!consent?.marketing_opt_in || campaign.status === "cancelled") {
      await query(
        sql`update growth_campaign_recipients set status='skipped',error_code='opted_out_or_cancelled',updated_at=now() where id=${r.id}::uuid`,
      );
      skipped++;
      continue;
    }
    try {
      const response = await send(
        `https://graph.facebook.com/${version}/${process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: r.phone,
            type: "template",
            biz_opaque_callback_data: r.id,
            template: {
              name: r.template_name,
              language: { code: r.language },
              components: [
                {
                  type: "body",
                  parameters: [r.name || "there", r.title, r.body, r.link].map(
                    (text) => ({ type: "text", text }),
                  ),
                },
              ],
            },
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      const data = (await response.json()) as {
        messages?: { id: string }[];
        error?: { code?: number };
      };
      if (!response.ok || !data.messages?.[0]?.id) {
        await query(
          sql`update growth_campaign_recipients set status='failed',error_code=${String(data.error?.code || response.status)},updated_at=now() where id=${r.id}::uuid`,
        );
        failed++;
        continue;
      }
      await query(
        sql`update growth_campaign_recipients set status=case when status in ('sent','delivered','read','failed') then status else 'accepted' end,provider_id=${data.messages[0].id},sent_at=now(),updated_at=now() where id=${r.id}::uuid`,
      );
      accepted++;
    } catch {
      await query(
        sql`update growth_campaign_recipients set status='unknown',error_code='delivery_outcome_unknown',updated_at=now() where id=${r.id}::uuid and status='sending'`,
      );
      failed++;
    }
  }
  await query(
    sql`update growth_campaigns c set status='completed',updated_at=now() where c.status in ('running','scheduled') and not exists(select 1 from growth_campaign_recipients r where r.campaign_id=c.id and r.status in ('queued','sending')) and exists(select 1 from growth_campaign_recipients r where r.campaign_id=c.id)`,
  );
  return { accepted, failed, skipped, processed };
}
export async function reconcileBatch(maxMs = 15000) {
  if (maxMs <= 0) return {processed:0};
  const started = Date.now();
  const [cursor] = await query<{ value: { after?: string } }>(
    sql`select value from growth_settings where id='reconcile_cursor'`,
  );
  const rows = await query<{ key: string }>(
    sql`select distinct growth_customer_key(phone,email) key from orders where growth_customer_key(phone,email) is not null and growth_customer_key(phone,email)>${cursor?.value?.after || ""} order by key limit 50`,
  );
  let processed = 0, last = cursor?.value?.after || "";
  for (const row of rows) { if (Date.now()-started >= maxMs) break; await reconcileCustomer(row.key); processed++; last=row.key; }
  const after = processed===rows.length && rows.length<50 ? "" : last;
  await query(
    sql`insert into growth_settings(id,value) values ('reconcile_cursor',${JSON.stringify({ after })}::jsonb) on conflict(id) do update set value=excluded.value,updated_at=now()`,
  );
  return { reconciled: processed };
}
export async function previewCampaign(keys:string[]) {
 const unique=[...new Set(keys)];
 if(!unique.length)return campaignAudience([],[]);
 try {const contacts=await retryGrowthRead(()=>query<CampaignContact>(sql`select customer_key as key,name,phone,marketing_opt_in from growth_accounts where customer_key in (${sql.join(unique.map(key=>sql`${key}`),sql`,`)})`));return campaignAudience(unique,contacts);}
 catch {throw new GrowthError('Could not load WhatsApp recipients. The database connection failed. Your campaign details are unchanged; retry Preview recipients.',503);}
}
export async function createCampaign(input: {
  title: string;
  body: string;
  link: string;
  keys: string[];
  scheduledAt?: string;
}) {
  const config = whatsappStatus();
  if (!input.keys.length) throw new GrowthError("Choose at least one customer.");
  const audience=await previewCampaign(input.keys);
  const unique=audience.eligible;
  if (!unique.length)
    throw new GrowthError(
      "No selected customers have recorded WhatsApp marketing consent and a valid phone.",
    );
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await query(
      sql`insert into growth_campaigns(id,title,body,link,template_name,language,scheduled_at) values (${id}::uuid,${input.title},${input.body},${input.link},${config.templateName},${config.language},${input.scheduledAt || null}::timestamptz)`,
      tx,
    );
    for (const r of unique)
      await query(
        sql`insert into growth_campaign_recipients(id,campaign_id,customer_key,phone,name) values (${randomUUID()}::uuid,${id}::uuid,${r.key},${r.phone},${r.name})`,
        tx,
      );
  });
  return { id, eligible: unique.length, excluded: audience.excluded };
}
