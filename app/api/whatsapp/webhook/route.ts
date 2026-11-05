import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { sql } from "drizzle-orm";
import { query } from "@/lib/growth/store";
export async function GET(req: NextRequest) {
  const token = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
  if (!token) return new NextResponse("Not configured", { status: 503 });
  return req.nextUrl.searchParams.get("hub.mode") === "subscribe" &&
    req.nextUrl.searchParams.get("hub.verify_token") === token
    ? new NextResponse(req.nextUrl.searchParams.get("hub.challenge"))
    : new NextResponse("Forbidden", { status: 403 });
}
export async function POST(req: NextRequest) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return new NextResponse("Not configured", { status: 503 });
  const body = await req.text();
  if (body.length > 1000000)
    return new NextResponse("Too large", { status: 413 });
  const given = req.headers.get("x-hub-signature-256") || "";
  const expected =
    "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  if (
    !/^sha256=[a-f0-9]{64}$/i.test(given) ||
    given.length !== expected.length ||
    !timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  )
    return new NextResponse("Invalid signature", { status: 403 });
  try {
    const data = JSON.parse(body) as {
      entry?: {
        changes?: {
          value?: {
            statuses?: {
              id: string;
              biz_opaque_callback_data?: string;
              status: string;
              errors?: { code: number }[];
            }[];
            messages?: {
              from: string;
              text?: { body?: string };
              button?: { text?: string };
            }[];
          };
        }[];
      }[];
    };
    for (const entry of data.entry || [])
      for (const change of entry.changes || []) {
        for (const status of change.value?.statuses || []) {
          if (!["sent", "delivered", "read", "failed"].includes(status.status))
            continue;
          await query(
            sql`update growth_campaign_recipients set status=${status.status},provider_id=coalesce(provider_id,${status.id}),error_code=${status.errors?.[0]?.code ? String(status.errors[0].code) : null},updated_at=now() where (provider_id=${status.id} or (id::text=${status.biz_opaque_callback_data || ''} and provider_id is null and status in ('sending','unknown'))) and (status<>'read' or ${status.status}='read') and (status<>'delivered' or ${status.status} in ('delivered','read'))`,
          );
        }
        for (const message of change.value?.messages || []) {
          if (
            /^(stop|unsubscribe|opt out)$/i.test(
              (message.text?.body || message.button?.text || "").trim(),
            )
          )
            await query(
              sql`update growth_accounts set marketing_opt_in=false,consent_source='whatsapp_stop',consent_at=now(),updated_at=now() where customer_key=growth_customer_key(${message.from},null)`,
            );
        }
      }
    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse("Invalid webhook", { status: 400 });
  }
}
