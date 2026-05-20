import { randomUUID } from "crypto";
import { resolve } from "path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import {
  buildCouponEmailHtml,
  buildCouponEmailSubject,
  buildCouponEmailText,
} from "../lib/email/coupon-template";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env"), override: false });

const PREVIOUS_COUPON_CODE = "B3G1";
const EARLY_BIRD_COUPON_CODE =
  process.env.EARLY_BIRD_COUPON_CODE?.trim().toUpperCase() || "HUME_EARLY_BIRD";
const SHOULD_SEND = process.env.SEND_EARLY_BIRD_EMAILS === "true";
const CONFIRM_SEND = process.env.CONFIRM_SEND === EARLY_BIRD_COUPON_CODE;
const SHOW_EMAILS = process.env.SHOW_EMAILS === "true";

type LeadRow = {
  email: string;
  session_id: string | null;
  path: string | null;
  referrer: string | null;
  last_b3g1_sent_at: string;
  b3g1_events: number;
};

type MailServiceModule = {
  isHumeMailConfigured: () => boolean;
  sendHumeEmail: (input: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    messageType: "coupon_resend";
    relatedType?: string;
    relatedId?: string;
    payload?: Record<string, unknown>;
  }) => Promise<{
    sent: boolean;
    error?: string;
    providerMessageId?: string;
    eventId?: string;
  }>;
};

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(name.length - visible.length, 3))}@${domain}`;
}

function sleep(ms: number) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const sql = neon(databaseUrl);
  const leads = (await sql`
    with ranked_b3g1 as (
      select
        lower(trim(destination)) as email,
        session_id,
        path,
        referrer,
        created_at as last_b3g1_sent_at,
        count(*) over (partition by lower(trim(destination)))::int as b3g1_events,
        row_number() over (
          partition by lower(trim(destination))
          order by created_at desc
        ) as row_number
      from coupon_code_events
      where channel = 'email'
        and event_type = 'sent'
        and upper(coupon_code) = ${PREVIOUS_COUPON_CODE}
        and destination is not null
        and position('@' in destination) > 1
    ),
    b3g1_recipients as (
      select email, session_id, path, referrer, last_b3g1_sent_at, b3g1_events
      from ranked_b3g1
      where row_number = 1
    ),
    already_sent as (
      select distinct lower(trim(destination)) as email
      from coupon_code_events
      where channel = 'email'
        and event_type = 'sent'
        and upper(coupon_code) = ${EARLY_BIRD_COUPON_CODE}
        and destination is not null
    )
    select b.email, b.session_id, b.path, b.referrer, b.last_b3g1_sent_at, b.b3g1_events
    from b3g1_recipients b
    left join already_sent a on a.email = b.email
    where a.email is null
    order by b.last_b3g1_sent_at desc
  `) as LeadRow[];

  console.log(`Coupon to send: ${EARLY_BIRD_COUPON_CODE}`);
  console.log(`Pending previous ${PREVIOUS_COUPON_CODE} recipients: ${leads.length}`);
  console.log(
    `Preview: ${leads
      .slice(0, 10)
      .map((lead) => (SHOW_EMAILS ? lead.email : maskEmail(lead.email)))
      .join(", ") || "none"}`,
  );

  if (!SHOULD_SEND || !CONFIRM_SEND) {
    console.log("");
    console.log("Dry run only. No emails were sent.");
    console.log(
      `To send: $env:SEND_EARLY_BIRD_EMAILS='true'; $env:CONFIRM_SEND='${EARLY_BIRD_COUPON_CODE}'; npx tsx scripts/send-early-bird-to-b3g1-leads.ts`,
    );
    return;
  }

  const mailServiceModule = (await import("../lib/email/hume-mail-service")) as
    | MailServiceModule
    | { default: MailServiceModule };
  const mailService =
    "sendHumeEmail" in mailServiceModule
      ? mailServiceModule
      : mailServiceModule.default;
  const { isHumeMailConfigured, sendHumeEmail } = mailService;

  if (!isHumeMailConfigured()) {
    throw new Error("HUME mail is not configured. Set RESEND_API_KEY and a sender email.");
  }

  let sent = 0;
  let failed = 0;

  for (const lead of leads) {
    const sendResult = await sendHumeEmail({
      to: lead.email,
      subject: buildCouponEmailSubject(EARLY_BIRD_COUPON_CODE),
      text: buildCouponEmailText(EARLY_BIRD_COUPON_CODE),
      html: buildCouponEmailHtml(EARLY_BIRD_COUPON_CODE, lead.email),
      messageType: "coupon_resend",
      relatedType: "coupon",
      relatedId: EARLY_BIRD_COUPON_CODE,
      payload: {
        source: "b3g1_to_early_bird_resend",
        previousCouponCode: PREVIOUS_COUPON_CODE,
      },
    });

    if (!sendResult.sent) {
      failed += 1;
      console.error(`Failed: ${maskEmail(lead.email)}`, sendResult.error);
      await sleep(500);
      continue;
    }

    await sql`
      insert into coupon_code_events (
        id,
        session_id,
        channel,
        event_type,
        coupon_code,
        destination,
        path,
        referrer,
        payload,
        created_at
      ) values (
        ${randomUUID()},
        ${lead.session_id},
        'email',
        'sent',
        ${EARLY_BIRD_COUPON_CODE},
        ${lead.email},
        ${lead.path},
        ${lead.referrer},
        ${JSON.stringify({
          source: "b3g1_to_early_bird_resend",
          previousCouponCode: PREVIOUS_COUPON_CODE,
          provider: "resend",
          resendEmailId: sendResult.providerMessageId ?? null,
          emailEventId: sendResult.eventId ?? null,
        })}::jsonb,
        now()
      )
    `;

    sent += 1;
    console.log(`Sent ${sent}/${leads.length}: ${maskEmail(lead.email)}`);
    await sleep(500);
  }

  console.log(`Done. Sent: ${sent}. Failed: ${failed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
