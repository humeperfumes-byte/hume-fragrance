import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

import { requireAdminToken } from "@/lib/admin-auth";

const requiredColumns: Record<string, string[]> = {
  checkout_drafts: [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "lead_status",
    "lead_notes",
    "last_contacted_at",
    "next_follow_up_at",
    "whatsapp_initiated_at",
    "acquisition_source",
    "acquisition_category",
    "acquisition_referrer_host",
    "country",
    "last_edited_field",
  ],
  orders: [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "acquisition_source",
    "acquisition_category",
    "acquisition_referrer_host",
  ],
  razorpay_webhook_events: [
    "event",
    "local_order_id",
    "order_number",
    "razorpay_order_id",
    "razorpay_payment_id",
    "razorpay_refund_id",
    "razorpay_dispute_id",
    "razorpay_settlement_id",
    "razorpay_downtime_id",
    "payload",
    "received_at",
  ],
  coupons: [
    "welcome_back_mode",
  ],
  email_events: [
    "message_type",
    "provider",
    "to_email",
    "from_email",
    "subject",
    "status",
    "provider_message_id",
    "related_type",
    "related_id",
    "payload",
  ],
  site_settings: [
    "key",
    "value",
    "updated_at",
  ],
};

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL is not configured",
      },
      { status: 503 },
    );
  }

  const sql = neon(databaseUrl);

  try {
    const tables = await Promise.all(
      Object.entries(requiredColumns).map(async ([tableName, columns]) => {
        const rows = await sql`
          select column_name
          from information_schema.columns
          where table_schema = 'public'
            and table_name = ${tableName}
        `;
        const present = new Set(rows.map((row) => String(row.column_name)));
        const missing = columns.filter((column) => !present.has(column));

        return {
          table: tableName,
          ok: missing.length === 0,
          missing,
        };
      }),
    );

    const ok = tables.every((table) => table.ok);

    return NextResponse.json(
      {
        ok,
        tables,
      },
      { status: ok ? 200 : 503 },
    );
  } catch (error) {
    console.error("Admin schema health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to inspect database schema",
      },
      { status: 500 },
    );
  }
}
