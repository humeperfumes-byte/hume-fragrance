import { sql } from "drizzle-orm";

import { db } from "@/db";
import { orders, type Order } from "@/db/schema";

const REMINDER_MARKER = "Payment pending reminder sent:";
const DEFAULT_REMINDER_AFTER_MINUTES = 15;
const DEFAULT_REMINDER_LOOKBACK_HOURS = 24;
const DEFAULT_BATCH_LIMIT = 20;

type WhatsAppSendResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
};

type ReminderRunResult = {
  ok: boolean;
  configured: boolean;
  scanned: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{ orderNumber: string; error: string }>;
};

function normalizeWhatsAppPhone(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11) return digits;
  return "";
}

function getReminderBody(order: Pick<Order, "fullName">) {
  const name = order.fullName?.trim();
  return name
    ? `Hi ${name}, your HUME order is saved but payment was not completed. Reply here if you faced any issue.`
    : "Hi, your HUME order is saved but payment was not completed. Reply here if you faced any issue.";
}

function getGraphApiVersion() {
  return process.env.WHATSAPP_CLOUD_API_VERSION || "v20.0";
}

function getWhatsAppConfig() {
  const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID?.trim();
  const templateName = process.env.WHATSAPP_PAYMENT_PENDING_TEMPLATE_NAME?.trim();
  const templateLanguage =
    process.env.WHATSAPP_PAYMENT_PENDING_TEMPLATE_LANGUAGE?.trim() || "en";

  return {
    configured: Boolean(accessToken && phoneNumberId),
    accessToken,
    phoneNumberId,
    templateName,
    templateLanguage,
  };
}

async function sendWhatsAppReminder(order: Order): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();
  const to = normalizeWhatsAppPhone(order.phone);

  if (!config.configured || !config.accessToken || !config.phoneNumberId) {
    return { ok: false, error: "WhatsApp Cloud API env vars are not configured." };
  }

  if (!to) {
    return { ok: false, error: "Order has no valid WhatsApp phone number." };
  }

  const body = config.templateName
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: config.templateName,
          language: { code: config.templateLanguage },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: order.fullName?.trim() || "there" },
                { type: "text", text: order.orderNumber },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: getReminderBody(order),
        },
      };

  const response = await fetch(
    `https://graph.facebook.com/${getGraphApiVersion()}/${config.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await response.json().catch(() => ({}))) as {
    messages?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    return {
      ok: false,
      error: data.error?.message || `WhatsApp API returned ${response.status}`,
    };
  }

  return {
    ok: true,
    providerMessageId: data.messages?.[0]?.id,
  };
}

async function markReminderSent(orderId: string, providerMessageId?: string) {
  const stamp = new Date().toISOString();
  const note = providerMessageId
    ? `\n\n${REMINDER_MARKER} ${stamp}\nReminder provider message ID: ${providerMessageId}`
    : `\n\n${REMINDER_MARKER} ${stamp}`;

  await db
    .update(orders)
    .set({
      whatsappMessage: sql`concat(coalesce(${orders.whatsappMessage}, ''), ${note})`,
      updatedAt: new Date(),
    })
    .where(sql`${orders.id} = ${orderId}`);
}

export async function sendPaymentPendingReminders({
  reminderAfterMinutes = DEFAULT_REMINDER_AFTER_MINUTES,
  lookbackHours = DEFAULT_REMINDER_LOOKBACK_HOURS,
  limit = DEFAULT_BATCH_LIMIT,
} = {}): Promise<ReminderRunResult> {
  const config = getWhatsAppConfig();

  if (!config.configured) {
    return {
      ok: true,
      configured: false,
      scanned: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };
  }

  const dueOrders = await db
    .select()
    .from(orders)
    .where(sql`
      ${orders.status} = 'payment_pending'
      and ${orders.checkoutChannel} = 'razorpay'
      and ${orders.createdAt} <= now() - (${reminderAfterMinutes}::text || ' minutes')::interval
      and ${orders.createdAt} >= now() - (${lookbackHours}::text || ' hours')::interval
      and coalesce(${orders.whatsappMessage}, '') not ilike ${`%${REMINDER_MARKER}%`}
      and coalesce(${orders.phone}, '') <> ''
    `)
    .orderBy(sql`${orders.createdAt} asc`)
    .limit(limit);

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const errors: ReminderRunResult["errors"] = [];

  for (const order of dueOrders) {
    if (!normalizeWhatsAppPhone(order.phone)) {
      skipped += 1;
      continue;
    }

    const result = await sendWhatsAppReminder(order);
    if (!result.ok) {
      failed += 1;
      errors.push({
        orderNumber: order.orderNumber,
        error: result.error || "Unable to send WhatsApp reminder.",
      });
      continue;
    }

    await markReminderSent(order.id, result.providerMessageId);
    sent += 1;
  }

  return {
    ok: failed === 0,
    configured: true,
    scanned: dueOrders.length,
    sent,
    failed,
    skipped,
    errors,
  };
}
