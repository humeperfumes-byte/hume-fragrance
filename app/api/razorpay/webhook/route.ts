import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { eq, ilike, or } from "drizzle-orm";

import { db } from "@/db";
import {
  checkoutDrafts,
  orders,
  razorpayWebhookEvents,
  type Order,
} from "@/db/schema";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";

export const runtime = "nodejs";

type RazorpayEntity = Record<string, unknown>;

const FINAL_FULFILLMENT_STATUSES = new Set(["shipped", "delivered", "cancelled"]);
const EMAIL_RECOVERY_STATUSES = new Set([
  "payment_pending",
  "payment_authorized",
  "payment_failed",
]);
const SUPPORTED_EVENTS = new Set([
  "order.paid",
  "payment.authorized",
  "payment.captured",
  "payment.failed",
  "refund.created",
  "refund.processed",
  "refund.failed",
  "refund.speed_changed",
  "payment.dispute.created",
  "payment.dispute.action_required",
  "payment.dispute.under_review",
  "payment.dispute.won",
  "payment.dispute.lost",
  "payment.dispute.closed",
  "settlement.processed",
  "payment.downtime.started",
  "payment.downtime.updated",
  "payment.downtime.resolved",
]);
const ORDERLESS_EVENTS = new Set([
  "settlement.processed",
  "payment.downtime.started",
  "payment.downtime.updated",
  "payment.downtime.resolved",
]);
const FINANCIAL_EXCEPTION_STATUSES = new Set([
  "refund_initiated",
  "partially_refunded",
  "refunded",
  "refund_failed",
  "payment_disputed",
  "dispute_action_required",
  "dispute_under_review",
  "dispute_won",
  "dispute_lost",
  "dispute_closed",
]);

function safeEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return safeEqual(expectedSignature, signature);
}

function asEntity(value: unknown): RazorpayEntity | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as RazorpayEntity;
}

function getNestedEntity(payload: RazorpayEntity, key: string): RazorpayEntity | null {
  const payloadContainer = asEntity(payload.payload);
  const entityContainer = asEntity(payloadContainer?.[key]);
  return asEntity(entityContainer?.entity);
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getAmountString(value: unknown) {
  const amount = getNumber(value);
  return amount === null ? null : String(amount);
}

function unixSecondsToDate(value: unknown) {
  const seconds = getNumber(value);
  return seconds === null ? null : new Date(seconds * 1000);
}

function getNotes(...entities: Array<RazorpayEntity | null>) {
  return entities.reduce<Record<string, string>>((acc, entity) => {
    const notes = asEntity(entity?.notes);
    if (!notes) return acc;

    Object.entries(notes).forEach(([key, value]) => {
      const normalized = getString(value);
      if (normalized) acc[key] = normalized;
    });

    return acc;
  }, {});
}

function formatPaymentMethod(method: string | null) {
  if (!method) return "Razorpay Online Payment";
  return `Razorpay ${method.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
}

function formatMinorAmount(amount: string | null, currency: string | null) {
  if (!amount) return null;
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return null;
  return `${currency ?? "INR"} ${(numericAmount / 100).toFixed(2)}`;
}

function resolveNextStatus({
  event,
  paymentStatus,
  refundStatus,
  refundAmount,
  paymentAmount,
  paymentRefundStatus,
  currentStatus,
}: {
  event: string;
  paymentStatus: string | null;
  refundStatus: string | null;
  refundAmount: string | null;
  paymentAmount: string | null;
  paymentRefundStatus: string | null;
  currentStatus: string;
}) {
  if (event.startsWith("refund.")) {
    if (event === "refund.failed" || refundStatus === "failed") return "refund_failed";
    if (event === "refund.created") return "refund_initiated";
    if (event === "refund.speed_changed") return currentStatus;

    const refundedAmount = Number(refundAmount);
    const totalPaymentAmount = Number(paymentAmount);
    if (paymentRefundStatus === "full") return "refunded";
    if (
      Number.isFinite(refundedAmount) &&
      Number.isFinite(totalPaymentAmount) &&
      totalPaymentAmount > 0 &&
      refundedAmount >= totalPaymentAmount
    ) {
      return "refunded";
    }

    return "partially_refunded";
  }

  if (event.startsWith("payment.dispute.")) {
    if (event === "payment.dispute.action_required") return "dispute_action_required";
    if (event === "payment.dispute.under_review") return "dispute_under_review";
    if (event === "payment.dispute.won") return "dispute_won";
    if (event === "payment.dispute.lost") return "dispute_lost";
    if (event === "payment.dispute.closed") return "dispute_closed";
    return "payment_disputed";
  }

  if (FINAL_FULFILLMENT_STATUSES.has(currentStatus)) return currentStatus;
  if (FINANCIAL_EXCEPTION_STATUSES.has(currentStatus)) return currentStatus;

  if (event === "order.paid" || event === "payment.captured" || paymentStatus === "captured") {
    return "processing";
  }

  if (event === "payment.authorized" || paymentStatus === "authorized") {
    return currentStatus === "payment_pending" ? "payment_authorized" : currentStatus;
  }

  if (event === "payment.failed" || paymentStatus === "failed") {
    return ["payment_pending", "payment_authorized"].includes(currentStatus)
      ? "payment_failed"
      : currentStatus;
  }

  return currentStatus;
}

function appendWebhookAudit({
  currentMessage,
  event,
  eventId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpayRefundId,
  razorpayDisputeId,
  razorpaySettlementId,
  razorpayDowntimeId,
  paymentStatus,
  paymentMethod,
  refundStatus,
  refundSpeedRequested,
  refundSpeedProcessed,
  disputeStatus,
  disputeReason,
  disputeRespondBy,
  settlementUtr,
  downtimeMethod,
  downtimeSeverity,
  amount,
  currency,
  failureReason,
}: {
  currentMessage: string | null;
  event: string;
  eventId: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;
  razorpayDisputeId: string | null;
  razorpaySettlementId: string | null;
  razorpayDowntimeId: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  refundStatus: string | null;
  refundSpeedRequested: string | null;
  refundSpeedProcessed: string | null;
  disputeStatus: string | null;
  disputeReason: string | null;
  disputeRespondBy: Date | null;
  settlementUtr: string | null;
  downtimeMethod: string | null;
  downtimeSeverity: string | null;
  amount: string | null;
  currency: string | null;
  failureReason: string | null;
}) {
  const idempotencyKey =
    eventId ??
    `${event}:${razorpayRefundId ?? razorpayDisputeId ?? razorpayPaymentId ?? razorpayOrderId ?? razorpaySettlementId ?? razorpayDowntimeId ?? "unknown"}`;
  if (currentMessage?.includes(idempotencyKey)) return currentMessage;

  const lines = [
    "Razorpay webhook:",
    `Event: ${event}`,
    `Webhook ID: ${idempotencyKey}`,
    razorpayOrderId ? `Razorpay Order ID: ${razorpayOrderId}` : null,
    razorpayPaymentId ? `Razorpay Payment ID: ${razorpayPaymentId}` : null,
    razorpayRefundId ? `Razorpay Refund ID: ${razorpayRefundId}` : null,
    razorpayDisputeId ? `Razorpay Dispute ID: ${razorpayDisputeId}` : null,
    razorpaySettlementId ? `Razorpay Settlement ID: ${razorpaySettlementId}` : null,
    razorpayDowntimeId ? `Razorpay Downtime ID: ${razorpayDowntimeId}` : null,
    amount ? `Amount: ${formatMinorAmount(amount, currency) ?? amount}` : null,
    paymentMethod ? `Payment Method: ${formatPaymentMethod(paymentMethod)}` : null,
    paymentStatus ? `Payment Status: ${paymentStatus}` : null,
    refundStatus ? `Refund Status: ${refundStatus}` : null,
    refundSpeedRequested ? `Refund Speed Requested: ${refundSpeedRequested}` : null,
    refundSpeedProcessed ? `Refund Speed Processed: ${refundSpeedProcessed}` : null,
    disputeStatus ? `Dispute Status: ${disputeStatus}` : null,
    disputeReason ? `Dispute Reason: ${disputeReason}` : null,
    disputeRespondBy ? `Respond By: ${disputeRespondBy.toISOString()}` : null,
    settlementUtr ? `Settlement UTR: ${settlementUtr}` : null,
    downtimeMethod ? `Downtime Method: ${downtimeMethod}` : null,
    downtimeSeverity ? `Downtime Severity: ${downtimeSeverity}` : null,
    failureReason ? `Failure Reason: ${failureReason}` : null,
  ].filter(Boolean);

  return [currentMessage, lines.join("\n")].filter(Boolean).join("\n\n");
}

async function findOrder({
  humeOrderId,
  humeOrderNumber,
  razorpayOrderId,
  razorpayPaymentId,
}: {
  humeOrderId: string | null;
  humeOrderNumber: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
}) {
  if (humeOrderId) {
    const [order] = await db.select().from(orders).where(eq(orders.id, humeOrderId)).limit(1);
    if (order) return order;
  }

  if (humeOrderNumber) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, humeOrderNumber))
      .limit(1);
    if (order) return order;
  }

  const orderIdMatcher = razorpayOrderId
    ? ilike(orders.whatsappMessage, `%Razorpay Order ID: ${razorpayOrderId}%`)
    : undefined;
  const paymentIdMatcher = razorpayPaymentId
    ? ilike(orders.whatsappMessage, `%Razorpay Payment ID: ${razorpayPaymentId}%`)
    : undefined;
  const fallbackMatcher =
    orderIdMatcher && paymentIdMatcher
      ? or(orderIdMatcher, paymentIdMatcher)
      : orderIdMatcher ?? paymentIdMatcher;

  if (fallbackMatcher) {
    const [order] = await db
      .select()
      .from(orders)
      .where(fallbackMatcher)
      .limit(1);
    if (order) return order;
  }

  return null;
}

async function recordWebhookEvent({
  id,
  payload,
  event,
  accountId,
  order,
  razorpayOrderId,
  razorpayPaymentId,
  razorpayRefundId,
  razorpayDisputeId,
  razorpaySettlementId,
  razorpayDowntimeId,
  entityType,
  entityId,
  status,
  amount,
  currency,
}: {
  id: string;
  payload: RazorpayEntity;
  event: string;
  accountId: string | null;
  order: Order | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;
  razorpayDisputeId: string | null;
  razorpaySettlementId: string | null;
  razorpayDowntimeId: string | null;
  entityType: string | null;
  entityId: string | null;
  status: string | null;
  amount: string | null;
  currency: string | null;
}) {
  try {
    await db
      .insert(razorpayWebhookEvents)
      .values({
        id,
        event,
        accountId,
        localOrderId: order?.id ?? null,
        orderNumber: order?.orderNumber ?? null,
        razorpayOrderId,
        razorpayPaymentId,
        razorpayRefundId,
        razorpayDisputeId,
        razorpaySettlementId,
        razorpayDowntimeId,
        entityType,
        entityId,
        status,
        amount,
        currency,
        matched: Boolean(order),
        payload,
        eventCreatedAt: unixSecondsToDate(payload.created_at),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: razorpayWebhookEvents.id,
        set: {
          localOrderId: order?.id ?? null,
          orderNumber: order?.orderNumber ?? null,
          status,
          matched: Boolean(order),
          payload,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.warn("Razorpay webhook event could not be recorded. Sync the database schema.", error);
  }
}

function sendRecoveryEmailIfNeeded(order: Order, nextStatus: string) {
  if (nextStatus !== "processing") return;
  if (!EMAIL_RECOVERY_STATUSES.has(order.status)) return;
  if (!order.email) return;

  sendOrderConfirmationEmail({
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod ?? "Razorpay Online Payment",
    shippingMethod: order.shippingMethod,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    grandTotal: order.grandTotal,
    details: {
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      addressLine1: order.addressLine1,
      addressLine2: order.addressLine2,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
    },
    cartSnapshot: order.cartSnapshot,
  }).catch((error) => {
    console.error("Razorpay webhook recovery email failed:", error);
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers.get("x-razorpay-signature");
  const eventIdHeader = request.headers.get("x-razorpay-event-id");
  const rawBody = await request.text();

  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Razorpay webhook secret is not configured" },
      { status: 500 },
    );
  }

  if (!signature || !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid Razorpay webhook signature" },
      { status: 400 },
    );
  }

  try {
    const payload = JSON.parse(rawBody) as RazorpayEntity;
    const event = getString(payload.event);

    if (!event || !SUPPORTED_EVENTS.has(event)) {
      return NextResponse.json({ ok: true, ignored: event ?? "unknown" });
    }

    const payment = getNestedEntity(payload, "payment");
    const orderEntity = getNestedEntity(payload, "order");
    const refund = getNestedEntity(payload, "refund");
    const dispute = getNestedEntity(payload, "dispute");
    const settlement = getNestedEntity(payload, "settlement");
    const downtime = getNestedEntity(payload, "payment.downtime");
    const notes = getNotes(orderEntity, payment, refund, dispute);
    const humeOrderId = getString(notes.humeOrderId);
    const humeOrderNumber =
      getString(notes.humeOrderNumber) ?? getString(orderEntity?.receipt);
    const checkoutSessionId = getString(notes.checkoutSessionId);
    const razorpayOrderId =
      getString(payment?.order_id) ?? getString(orderEntity?.id);
    const razorpayPaymentId =
      getString(payment?.id) ?? getString(refund?.payment_id) ?? getString(dispute?.payment_id);
    const razorpayRefundId = getString(refund?.id);
    const razorpayDisputeId = getString(dispute?.id);
    const razorpaySettlementId = getString(settlement?.id);
    const razorpayDowntimeId = getString(downtime?.id);
    const primaryEntity = refund ?? dispute ?? settlement ?? downtime ?? payment ?? orderEntity;
    const entityType = getString(primaryEntity?.entity);
    const entityId = getString(primaryEntity?.id);
    const webhookEventId =
      eventIdHeader ??
      crypto.createHash("sha256").update(rawBody).digest("hex").slice(0, 40);
    const paymentStatus = getString(payment?.status) ?? getString(orderEntity?.status);
    const paymentMethod = getString(payment?.method);
    const refundStatus = getString(refund?.status);
    const paymentRefundStatus = getString(payment?.refund_status);
    const disputeStatus = getString(dispute?.status);
    const disputeReason = getString(dispute?.reason_code);
    const disputeRespondBy = unixSecondsToDate(dispute?.respond_by);
    const settlementStatus = getString(settlement?.status);
    const settlementUtr = getString(settlement?.utr);
    const downtimeStatus = getString(downtime?.status);
    const downtimeMethod = getString(downtime?.method);
    const downtimeSeverity = getString(downtime?.severity);
    const amount =
      getAmountString(refund?.amount) ??
      getAmountString(dispute?.amount) ??
      getAmountString(settlement?.amount) ??
      getAmountString(payment?.amount) ??
      getAmountString(orderEntity?.amount);
    const paymentAmount = getAmountString(payment?.amount);
    const currency =
      getString(refund?.currency) ??
      getString(dispute?.currency) ??
      getString(settlement?.currency) ??
      getString(payment?.currency) ??
      getString(orderEntity?.currency);
    const eventStatus =
      refundStatus ??
      disputeStatus ??
      settlementStatus ??
      downtimeStatus ??
      paymentStatus;
    const failureReason =
      getString(payment?.error_description) ??
      getString(payment?.error_reason) ??
      getString(payment?.error_code);

    const existingOrder = ORDERLESS_EVENTS.has(event)
      ? null
      : await findOrder({
          humeOrderId,
          humeOrderNumber,
          razorpayOrderId,
          razorpayPaymentId,
        });

    await recordWebhookEvent({
      id: webhookEventId,
      payload,
      event,
      accountId: getString(payload.account_id),
      order: existingOrder,
      razorpayOrderId,
      razorpayPaymentId,
      razorpayRefundId,
      razorpayDisputeId,
      razorpaySettlementId,
      razorpayDowntimeId,
      entityType,
      entityId,
      status: eventStatus,
      amount,
      currency,
    });

    if (!existingOrder) {
      if (!ORDERLESS_EVENTS.has(event)) {
        console.warn("Razorpay webhook could not match a local order", {
          event,
          webhookEventId,
          humeOrderId,
          humeOrderNumber,
          razorpayOrderId,
          razorpayPaymentId,
          razorpayRefundId,
          razorpayDisputeId,
        });
      }

      return NextResponse.json({
        ok: true,
        matched: false,
        event,
      });
    }

    const nextStatus = resolveNextStatus({
      event,
      paymentStatus,
      refundStatus,
      refundAmount: getAmountString(refund?.amount),
      paymentAmount,
      paymentRefundStatus,
      currentStatus: existingOrder.status,
    });
    const nextPaymentMethod =
      event === "payment.failed"
        ? existingOrder.paymentMethod ?? formatPaymentMethod(paymentMethod)
        : paymentMethod
          ? formatPaymentMethod(paymentMethod)
          : existingOrder.paymentMethod;
    const nextMessage = appendWebhookAudit({
      currentMessage: existingOrder.whatsappMessage,
      event,
      eventId: webhookEventId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpayRefundId,
      razorpayDisputeId,
      razorpaySettlementId,
      razorpayDowntimeId,
      paymentStatus,
      paymentMethod,
      refundStatus,
      refundSpeedRequested: getString(refund?.speed_requested),
      refundSpeedProcessed: getString(refund?.speed_processed),
      disputeStatus,
      disputeReason,
      disputeRespondBy,
      settlementUtr,
      downtimeMethod,
      downtimeSeverity,
      amount,
      currency,
      failureReason,
    });

    await db
      .update(orders)
      .set({
        status: nextStatus,
        paymentMethod: nextPaymentMethod,
        whatsappMessage: nextMessage,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, existingOrder.id));

    if (checkoutSessionId && nextStatus === "processing") {
      await db
        .update(checkoutDrafts)
        .set({
          status: "complete",
          leadStatus: "converted",
          updatedAt: new Date(),
        })
        .where(eq(checkoutDrafts.sessionId, checkoutSessionId));
    }

    sendRecoveryEmailIfNeeded(
      { ...existingOrder, paymentMethod: nextPaymentMethod, whatsappMessage: nextMessage },
      nextStatus,
    );

    return NextResponse.json({
      ok: true,
      matched: true,
      event,
      status: nextStatus,
      orderNumber: existingOrder.orderNumber,
    });
  } catch (error) {
    console.error("Razorpay webhook processing error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to process Razorpay webhook" },
      { status: 500 },
    );
  }
}
