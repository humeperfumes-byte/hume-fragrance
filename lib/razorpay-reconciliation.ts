import { randomUUID } from "node:crypto";
import Razorpay from "razorpay";
import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { orderEditAudits, orders, razorpayWebhookEvents, type Order } from "@/db/schema";

type ProviderOrder = {
  id: string;
  status?: string;
  amount?: number;
  amount_paid?: number;
  created_at?: number;
  receipt?: string;
};

type ProviderPayment = {
  id: string;
  order_id: string;
  status?: string;
  amount?: number;
  captured?: boolean;
  method?: string;
  currency?: string;
  created_at?: number;
};

export type PaymentReconciliationResult = {
  order: Order;
  providerOrders: number;
  capturedPayments: number;
  capturedAmount: number;
  expectedAmount: number;
  difference: number;
  syncStatus: string;
  changed: boolean;
};

function getClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials are not configured");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function extractOrderId(message: string | null) {
  return message?.match(/Razorpay Order ID:\s*(order_[A-Za-z0-9]+)/i)?.[1] ?? null;
}

async function findProviderOrders(order: Order) {
  const client = getClient();
  const found = new Map<string, ProviderOrder>();
  const knownId = order.razorpayOrderId || extractOrderId(order.whatsappMessage);

  if (knownId) {
    try {
      const providerOrder = await client.orders.fetch(knownId) as unknown as ProviderOrder;
      found.set(providerOrder.id, providerOrder);
    } catch (error) {
      console.warn("Stored Razorpay order could not be fetched", { orderId: order.id, knownId, error });
    }
  }

  const matches = await client.orders.all({ receipt: order.orderNumber, count: 100 }) as unknown as { items?: ProviderOrder[] };
  for (const providerOrder of matches.items ?? []) found.set(providerOrder.id, providerOrder);
  return { client, providerOrders: [...found.values()].sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0)) };
}

export async function reconcileOrderPayment(orderId: string, actor = "admin") {
  const [current] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!current) throw new Error("Order not found");
  if (current.checkoutChannel !== "razorpay") throw new Error("This is not a Razorpay order");

  const { client, providerOrders } = await findProviderOrders(current);
  const payments: ProviderPayment[] = [];
  for (const providerOrder of providerOrders) {
    const response = await client.orders.fetchPayments(providerOrder.id) as unknown as { items?: ProviderPayment[] };
    payments.push(...(response.items ?? []));
  }

  const captured = payments.filter((payment) => payment.captured || payment.status === "captured");
  const capturedMinor = captured.reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const capturedAmount = capturedMinor / 100;
  const expectedAmount = Number(current.grandTotal || 0);
  const difference = expectedAmount - capturedAmount;
  const syncStatus = captured.length > 1
    ? "multiple_captures"
    : captured.length === 0
      ? "unpaid"
      : Math.abs(difference) > 0.009
        ? "amount_mismatch"
        : "captured";
  const primaryPayment = captured.at(-1) ?? null;
  const paidProviderOrder = primaryPayment
    ? providerOrders.find((providerOrder) => providerOrder.id === primaryPayment.order_id) ?? null
    : null;
  const protectedStatus = new Set(["processing", "packed", "shipped", "delivered", "complete", "cancelled"]);
  const nextStatus = captured.length && !protectedStatus.has(current.status) ? "processing" : current.status;
  const now = new Date();

  const updated = await db.transaction(async (tx) => {
    for (const payment of payments) {
      await tx.insert(razorpayWebhookEvents).values({
        id: `reconcile-${payment.id}`,
        event: payment.captured || payment.status === "captured" ? "payment.reconciled_captured" : "payment.reconciled",
        localOrderId: current.id,
        orderNumber: current.orderNumber,
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        entityType: "payment",
        entityId: payment.id,
        status: payment.status ?? null,
        amount: String(payment.amount ?? 0),
        currency: payment.currency ?? "INR",
        matched: true,
        payload: { ...payment, reconciliationSource: actor },
        eventCreatedAt: payment.created_at ? new Date(payment.created_at * 1000) : null,
        updatedAt: now,
      }).onConflictDoNothing();
    }

    const [order] = await tx.update(orders).set({
      status: nextStatus,
      razorpayOrderId: paidProviderOrder?.id ?? current.razorpayOrderId ?? providerOrders.at(-1)?.id ?? null,
      razorpayPaymentId: primaryPayment?.id ?? current.razorpayPaymentId,
      capturedPaymentAmount: captured.length ? capturedAmount.toFixed(2) : current.capturedPaymentAmount,
      paymentCapturedAt: primaryPayment?.created_at ? new Date(primaryPayment.created_at * 1000) : current.paymentCapturedAt,
      paymentReconciledAt: now,
      paymentSyncStatus: syncStatus,
      paymentAttemptCount: providerOrders.length,
      updatedAt: now,
    }).where(eq(orders.id, current.id)).returning();

    const changed = JSON.stringify(current) !== JSON.stringify(order);
    await tx.insert(orderEditAudits).values({
      id: `order-audit-${randomUUID()}`,
      orderId: current.id,
      changeType: "payment_reconciliation",
      reason: `Razorpay reconciliation: ${syncStatus}; ${captured.length} captured payment(s); ₹${capturedAmount.toFixed(2)} captured`,
      actor,
      beforeSnapshot: current,
      afterSnapshot: order,
    });
    return { order, changed };
  });

  return {
    order: updated.order,
    providerOrders: providerOrders.length,
    capturedPayments: captured.length,
    capturedAmount,
    expectedAmount,
    difference,
    syncStatus,
    changed: updated.changed,
  } satisfies PaymentReconciliationResult;
}

export async function reconcilePendingRazorpayOrders(limit = 50) {
  const candidates = await db.select().from(orders)
    .where(eq(orders.checkoutChannel, "razorpay"))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
  const pending = candidates.filter((order) => ["payment_pending", "payment_authorized", "payment_failed"].includes(order.status));
  const results: PaymentReconciliationResult[] = [];
  for (const order of pending) {
    try {
      results.push(await reconcileOrderPayment(order.id, "system:razorpay_reconciliation"));
    } catch (error) {
      console.error("Automatic Razorpay reconciliation failed", { orderId: order.id, error });
    }
  }
  return { checked: pending.length, reconciled: results.filter((result) => result.capturedPayments > 0).length, results };
}
