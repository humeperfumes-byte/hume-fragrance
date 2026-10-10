import type { Order } from "@/db/schema";
import { MANUAL_LINK_CHANNEL, readManualPayment } from "./manual-order";
export function customerOrderView(order: Order, expectedMinor?: number | null) {
  const manual = order.checkoutChannel === MANUAL_LINK_CHANNEL ? readManualPayment(order.whatsappMessage) : null;
  const total = Number(order.grandTotal || 0);
  const partial = /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || "");
  const expected = expectedMinor ? expectedMinor / 100 : manual ? manual.advanceMinor / 100 : partial ? Math.max(1, Math.round(total * 0.2)) : total;
  const received = Number(order.capturedPaymentAmount || 0);
  const refund = /refund|disput/i.test(order.status);
  const verified = !refund && !!order.paymentCapturedAt && Math.round(received * 100) === Math.round(expected * 100) && expected > 0;
  const status = ["processing", "packed", "shipped", "delivered", "complete", "cancelled", "refunded"].includes(order.status) ? order.status : "received";
  return {
    orderNumber: order.orderNumber, status, payment: refund ? "Contact HUME for payment details" : verified ? partial ? "Advance received" : "Payment received" : "Awaiting payment verification",
    total, received: verified ? received : 0, codBalance: verified && partial ? Math.max(0, total - received) : null,
    city: order.city || "", country: order.country || "IN",
    trackingNumber: order.trackingNumber || "", carrier: order.fulfillmentCarrier || "", trackingStatus: order.trackingStatus || "",
    items: (order.cartSnapshot || []).map(item => ({ name: item.name, size: item.size || "", quantity: item.quantity, price: item.isGift ? 0 : item.price, isGift: !!item.isGift, selections: (item.sampleSelections || item.kitSelections || []).map(selection => selection.name) })),
  };
}
