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
  const ntfyTopic = process.env.ADMIN_NTFY_TOPIC || process.env.NTFY_TOPIC;

  if (!botToken && !chatId && !ntfyTopic) {
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

  // 1. Send via Telegram
  if (botToken && chatId) {
    const keyboard = [
      [{ text: "Open order panel", url: adminUrl }],
      [
        ...(whatsappUrl ? [{ text: "WhatsApp customer", url: whatsappUrl }] : []),
        { text: "Add tracking", url: trackingUrl },
      ],
      [{ text: "Mark packed", url: adminUrl }],
    ].filter((row) => row.length > 0);

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
    } catch (error) {
      console.error("Admin order Telegram alert failed:", error);
    }
  }

  // 2. Send via ntfy.sh
  if (ntfyTopic) {
    try {
      const plainTextMessage = message.replace(/<[^>]*>/g, ""); // strip HTML tags
      const headers: Record<string, string> = {
        "Title": getAlertTitle(order),
        "Priority": "high",
        "Click": adminUrl,
      };
      await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        headers,
        body: plainTextMessage,
      });
    } catch (error) {
      console.error("Admin order ntfy alert failed:", error);
    }
  }

  return true;
}

export type AdminCheckoutDraftAlertData = {
  sessionId: string;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  grandTotal?: string | number | null;
  cartSnapshot: Array<{
    name: string;
    quantity: number;
    size?: string;
  }>;
  type: "initiated" | "contact_added";
};

export async function sendAdminCheckoutDraftAlert(draft: AdminCheckoutDraftAlertData) {
  const botToken = process.env.ADMIN_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  const ntfyTopic = process.env.ADMIN_NTFY_TOPIC || process.env.NTFY_TOPIC;

  if (!botToken && !chatId && !ntfyTopic) {
    return false;
  }

  const title = draft.type === "initiated"
    ? "Checkout Initiated 🛒"
    : "Checkout Lead Captured 👤";

  const customerName = clean(draft.fullName) || "Anonymous";
  const phone = displayPhoneNumber(draft.phone) || "Not provided yet";
  const email = clean(draft.email) || "Not provided yet";

  const items = draft.cartSnapshot
    .map((item) => `- ${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ""}`)
    .join("\n");

  const total = draft.grandTotal ? formatAmount(draft.grandTotal) : "Unknown";

  const message = [
    `<b>${escapeHtml(title)}</b>`,
    "",
    `<b>Session:</b> ${escapeHtml(draft.sessionId.substring(0, 8))}...`,
    `<b>Value:</b> ${escapeHtml(total)}`,
    `<b>Customer:</b> ${escapeHtml(customerName)}`,
    `<b>Phone:</b> ${escapeHtml(phone)}`,
    `<b>Email:</b> ${escapeHtml(email)}`,
    items ? `<b>Items:</b>\n${escapeHtml(items)}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const adminUrl = buildAdminOrderUrl().replace("/orders", "/checkouts");
  const whatsappUrl = buildCustomerWhatsAppUrl(draft.phone || null);

  // Send via Telegram
  if (botToken && chatId) {
    const keyboard = [
      [{ text: "Open checkout drafts", url: adminUrl }],
      ...(whatsappUrl ? [[{ text: "WhatsApp lead", url: whatsappUrl }]] : []),
    ];

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
    } catch (error) {
      console.error("Admin checkout draft Telegram alert failed:", error);
    }
  }

  // Send via ntfy.sh
  if (ntfyTopic) {
    try {
      const plainTextMessage = message.replace(/<[^>]*>/g, ""); // strip HTML tags
      const headers: Record<string, string> = {
        "Title": title,
        "Priority": "default",
        "Click": adminUrl,
      };
      await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        headers,
        body: plainTextMessage,
      });
    } catch (error) {
      console.error("Admin checkout draft ntfy alert failed:", error);
    }
  }

  return true;
}
