import type { Order } from "@/db/schema";
import { displayPhoneNumber } from "./phone";
import { MANUAL_LINK_CHANNEL, readManualPayment } from "./manual-order";

const money = (value: number | string) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value));

export function buildOrderSuccessMessage(order: Order): string {
  const confirmed = ["payment_authorized", "processing", "packed", "shipped", "delivered", "complete"].includes(order.status);
  const items = (order.cartSnapshot || []).map(item => {
    const line = `• ${item.name}${item.size ? ` (${item.size})` : ""} × ${item.quantity}${item.isGift ? " — complimentary" : ""}`;
    const selections = item.sampleSelections?.length ? item.sampleSelections : item.kitSelections;
    return selections?.length ? `${line}\n  Fragrances: ${selections.map(selection => selection.name).join(", ")}` : line;
  });
  const address = [order.addressLine1, order.addressLine2, [order.city, order.state, order.pincode].filter(Boolean).join(", ")].filter(value => value?.trim()).join("\n");
  const phone = displayPhoneNumber(order.phone);
  const alternate = displayPhoneNumber(order.alternatePhone);
  const payment = order.checkoutChannel === MANUAL_LINK_CHANNEL ? readManualPayment(order.whatsappMessage) : null;
  const received = Number(order.capturedPaymentAmount || 0);
  const sections = [
    `Hi ${order.fullName?.trim() || "there"},`,
    confirmed ? "*Your HUME order is confirmed!*\nThank you for choosing HUME Fragrance." : "*Your HUME order details*",
    `*Order:* #${order.orderNumber}`,
    items.length ? `*Items*\n${items.join("\n")}` : "",
    [`*Order total:* ${money(order.grandTotal || 0)}`, order.paymentMethod ? `Payment method: ${order.paymentMethod}` : "", received > 0 ? `Online payment received: ${money(received)}` : "", payment && payment.codMinor > 0 ? `Pay on delivery: ${money(payment.codMinor / 100)}` : ""].filter(Boolean).join("\n"),
    [`*Delivery details*`, order.fullName?.trim(), address, phone ? `Mobile: ${phone}` : "", alternate ? `Alternate mobile: ${alternate}` : ""].filter(Boolean).join("\n"),
    "*Please check your details*\nReview the items, mobile number and delivery address above. Reply here if anything needs correcting.",
    confirmed ? "We’ll share the tracking link once your order is dispatched." : "We’ll confirm payment and share the next update here.",
    "Need help? Reply to this message.\nTeam HUME Fragrance",
  ];
  return sections.filter(Boolean).join("\n\n");
}
