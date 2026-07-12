import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "../../db";
import { emailEvents } from "../../db/schema";

const DEFAULT_FROM_EMAIL = "HUME Fragrance <support@humefragrance.com>";

export type HumeEmailMessageType =
  | "coupon_code"
  | "coupon_resend"
  | "order_confirmation"
  | "account_otp"
  | "admin_message"
  | "partnership_pitch";

export type HumeEmailStatus = "pending" | "sent" | "failed" | "dry_run";

export type HumeEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  messageType: HumeEmailMessageType;
  from?: string;
  relatedType?: string;
  relatedId?: string;
  payload?: Record<string, unknown>;
  idempotencyKey?: string;
};

export type HumeEmailResult = {
  ok: boolean;
  sent: boolean;
  status: HumeEmailStatus;
  eventId?: string;
  providerMessageId?: string;
  error?: string;
  deduped?: boolean;
};

type ExistingEmailEvent = {
  id: string;
  status: HumeEmailStatus;
  providerMessageId: string | null;
  error: string | null;
};

type EmailEventClaim =
  | { id: string; deduped: false }
  | {
      id: string;
      deduped: true;
      status: HumeEmailStatus;
      providerMessageId?: string;
      error?: string;
    };

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

function getFromEmail(inputFrom?: string) {
  return (
    inputFrom?.trim() ||
    process.env.HUME_EMAIL_FROM?.trim() ||
    process.env.COUPON_EMAIL_FROM?.trim() ||
    process.env.ORDER_EMAIL_FROM?.trim() ||
    DEFAULT_FROM_EMAIL
  );
}

function normalizeError(error: unknown) {
  if (!error) return "Unknown email provider error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown email provider error";
  }
}

function readExecuteRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: T[] }).rows;
  }
  return [];
}

export function isHumeMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getFromEmail());
}

async function markEmailEvent(
  eventId: string | undefined,
  values: {
    status: HumeEmailStatus;
    providerMessageId?: string | null;
    error?: string | null;
  },
) {
  if (!eventId) return;

  try {
    await db
      .update(emailEvents)
      .set({
        status: values.status,
        providerMessageId: values.providerMessageId ?? null,
        error: values.error ?? null,
        updatedAt: new Date(),
      })
      .where(eq(emailEvents.id, eventId));
  } catch (error) {
    console.error("Email event update failed:", error);
  }
}

async function createEmailEvent(
  input: HumeEmailInput,
  fromEmail: string,
): Promise<EmailEventClaim | undefined> {
  const id = randomUUID();
  const toEmail = cleanEmail(input.to);
  const idempotencyKey = input.idempotencyKey?.trim();

  try {
    if (idempotencyKey) {
      return await db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${idempotencyKey}))`);

        const existingResult = await tx.execute(sql`
          select
            id,
            status,
            provider_message_id as "providerMessageId",
            error
          from email_events
          where message_type = ${input.messageType}
            and to_email = ${toEmail}
            and coalesce(related_type, '') = ${input.relatedType ?? ""}
            and coalesce(related_id, '') = ${input.relatedId ?? ""}
            and (
              status in ('sent', 'dry_run')
              or (status = 'pending' and created_at > now() - interval '15 minutes')
            )
          order by created_at desc
          limit 1
        `);
        const existing = readExecuteRows<ExistingEmailEvent>(existingResult)[0];
        if (existing) {
          return {
            id: existing.id,
            deduped: true,
            status: existing.status,
            providerMessageId: existing.providerMessageId ?? undefined,
            error: existing.error ?? undefined,
          };
        }

        await tx.insert(emailEvents).values({
          id,
          messageType: input.messageType,
          provider: "resend",
          toEmail,
          fromEmail,
          subject: input.subject,
          status: "pending",
          relatedType: input.relatedType ?? null,
          relatedId: input.relatedId ?? null,
          payload: input.payload ?? {},
        });

        return { id, deduped: false };
      });
    }

    await db.insert(emailEvents).values({
      id,
      messageType: input.messageType,
      provider: "resend",
      toEmail,
      fromEmail,
      subject: input.subject,
      status: "pending",
      relatedType: input.relatedType ?? null,
      relatedId: input.relatedId ?? null,
      payload: input.payload ?? {},
    });
    return { id, deduped: false };
  } catch (error) {
    console.error("Email event insert failed:", error);
    return undefined;
  }
}

export async function sendHumeEmail(input: HumeEmailInput): Promise<HumeEmailResult> {
  const toEmail = cleanEmail(input.to);
  const fromEmail = getFromEmail(input.from);
  const eventClaim = await createEmailEvent({ ...input, to: toEmail }, fromEmail);
  const eventId = eventClaim?.id;

  if (eventClaim?.deduped) {
    const sent = eventClaim.status === "sent" || eventClaim.status === "pending";
    return {
      ok: true,
      sent,
      status: eventClaim.status,
      eventId,
      providerMessageId: eventClaim.providerMessageId,
      error: eventClaim.error,
      deduped: true,
    };
  }

  if (process.env.EMAIL_DRY_RUN === "true") {
    await markEmailEvent(eventId, { status: "dry_run" });
    return { ok: true, sent: false, status: "dry_run", eventId };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    const error = "RESEND_API_KEY is not configured.";
    await markEmailEvent(eventId, { status: "failed", error });
    return { ok: false, sent: false, status: "failed", eventId, error };
  }

  try {
    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    if (result.error || !result.data?.id) {
      const error = normalizeError(result.error);
      await markEmailEvent(eventId, { status: "failed", error });
      return { ok: false, sent: false, status: "failed", eventId, error };
    }

    await markEmailEvent(eventId, {
      status: "sent",
      providerMessageId: result.data.id,
    });

    return {
      ok: true,
      sent: true,
      status: "sent",
      eventId,
      providerMessageId: result.data.id,
    };
  } catch (error) {
    const message = normalizeError(error);
    await markEmailEvent(eventId, { status: "failed", error: message });
    return { ok: false, sent: false, status: "failed", eventId, error: message };
  }
}
