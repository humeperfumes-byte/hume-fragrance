import { SITE_URL, siteUrlForBase } from "@/lib/site";
import { displayPhoneNumber } from "@/lib/phone";

type AlertOrderItem = {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  isGift?: boolean;
  sampleSelections?: Array<{
    id: string;
    name: string;
    inspiration?: string;
  }>;
};

export type AdminOrderAlertData = {
  orderNumber: string;
  status: string;
  checkoutChannel?: string | null;
  paymentMethod?: string | null;
  shippingMethod?: string | null;
  subtotal?: string | number | null;
  shippingFee?: string | number | null;
  grandTotal?: string | number | null;
  details: {
    fullName?: string | null;
    phone?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  };
  cartSnapshot: AlertOrderItem[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAmount(value: string | number | null | undefined) {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return "Amount unavailable";
  return `Rs. ${numberValue.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: numberValue % 1 === 0 ? 0 : 2,
  })}`;
}

function clean(value: string | null | undefined) {
  return value?.trim() || null;
}

function buildAddress(order: AdminOrderAlertData) {
  return [
    order.details.addressLine1,
    order.details.addressLine2,
    [order.details.city, order.details.state, order.details.pincode]
      .filter(Boolean)
      .join(", "),
  ]
    .map((line) => clean(line))
    .filter(Boolean)
    .join("\n");
}

function buildItems(order: AdminOrderAlertData) {
  return order.cartSnapshot
    .slice(0, 8)
    .map((item) => {
      const meta = [item.size, item.isGift ? "Gift" : null].filter(Boolean).join(" / ");
      const samples = item.sampleSelections?.length
        ? `\n  Samples: ${item.sampleSelections.map((selection) => selection.name).join(", ")}`
        : "";
      return `- ${item.quantity}x ${item.name}${meta ? ` (${meta})` : ""}${samples}`;
    })
    .join("\n");
}

const ADMIN_ALERT_STATUSES = new Set(["processing", "whatsapp_initiated", "pending_whatsapp"]);

function buildAdminOrderUrl() {
  return process.env.ADMIN_ORDER_ALERT_URL || siteUrlForBase(SITE_URL, "/admin/orders");
}

function buildAdminTrackingUrl() {
  const adminUrl = buildAdminOrderUrl();
  try {
    return new URL("/admin/tracking", adminUrl).toString();
  } catch {
    return siteUrlForBase(SITE_URL, "/admin/tracking");
  }
}

function buildCustomerWhatsAppUrl(phone: string | null) {
  const digits = phone?.replace(/\D/g, "") || "";
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  if (normalized.length < 10) return null;
  return `https://wa.me/${normalized}`;
}

export function shouldSendAdminOrderAlert(status: string, previousStatus?: string | null) {
  return ADMIN_ALERT_STATUSES.has(status) && previousStatus !== status;
}

function getAlertTitle(order: AdminOrderAlertData) {
  if (order.checkoutChannel === "whatsapp" || order.status.includes("whatsapp")) {
    return "New WhatsApp HUME order";
  }

  return "New paid HUME order";
}

export async function sendAdminOrderAlert(order: AdminOrderAlertData) {
  const botToken = process.env.ADMIN_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  const customerName = clean(order.details.fullName) || "No name";
  const phone = displayPhoneNumber(order.details.phone) || "No phone";
  const email = clean(order.details.email);
  const address = buildAddress(order);
  const items = buildItems(order);
  const adminUrl = buildAdminOrderUrl();
  const trackingUrl = buildAdminTrackingUrl();
  const whatsappUrl = buildCustomerWhatsAppUrl(phone);
  const keyboard = [
    [{ text: "Open order panel", url: adminUrl }],
    [
      ...(whatsappUrl ? [{ text: "WhatsApp customer", url: whatsappUrl }] : []),
      { text: "Add tracking", url: trackingUrl },
    ],
    [{ text: "Mark packed", url: adminUrl }],
  ].filter((row) => row.length > 0);

  const message = [
    `<b>${escapeHtml(getAlertTitle(order))}</b>`,
    "",
    `<b>Order:</b> ${escapeHtml(order.orderNumber)}`,
    `<b>Total:</b> ${escapeHtml(formatAmount(order.grandTotal))}`,
    `<b>Payment:</b> ${escapeHtml(order.paymentMethod || "Razorpay Online Payment")}`,
    `<b>Customer:</b> ${escapeHtml(customerName)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    email ? `<b>Email:</b> ${escapeHtml(email)}` : null,
    address ? `<b>Address:</b>\n${escapeHtml(address)}` : null,
    items ? `<b>Items:</b>\n${escapeHtml(items)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: keyboard,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Admin order Telegram alert failed:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Admin order Telegram alert failed:", error);
    return false;
  }
}
