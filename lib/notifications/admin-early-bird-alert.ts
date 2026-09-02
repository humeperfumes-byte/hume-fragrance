type EarlyBirdAlertInput = {
  phone: string;
  couponCode: string;
  path?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendAdminEarlyBirdAlert(input: EarlyBirdAlertInput) {
  const botToken = process.env.ADMIN_TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID?.trim();
  if (!botToken || !chatId) return false;

  const whatsappUrl = `https://wa.me/${input.phone}`;
  const message = [
    "<b>New Early Bird request</b>",
    "",
    `<b>WhatsApp:</b> +${escapeHtml(input.phone)}`,
    `<b>Code to send manually:</b> ${escapeHtml(input.couponCode)}`,
    input.path ? `<b>Requested from:</b> ${escapeHtml(input.path)}` : null,
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[{ text: "Open customer WhatsApp", url: whatsappUrl }]],
        },
      }),
    });

    if (!response.ok) {
      console.error(`Early Bird Telegram alert returned ${response.status}.`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Early Bird Telegram alert failed:", error);
    return false;
  }
}
