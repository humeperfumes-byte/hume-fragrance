import assert from "node:assert/strict";
import test from "node:test";
import { sendAdminCheckoutDraftAlert, sendAdminOrderAlert } from "../lib/notifications/admin-order-alert";

test("Telegram receives draft/contact/order events without calling the real bot", async () => {
  const keys = ["ADMIN_TELEGRAM_BOT_TOKEN", "ADMIN_TELEGRAM_CHAT_ID", "ADMIN_NTFY_TOPIC", "NTFY_TOPIC"];
  const previous = keys.map(key => process.env[key]);
  const originalFetch = globalThis.fetch;
  const messages: string[] = [];
  try {
    process.env.ADMIN_TELEGRAM_BOT_TOKEN = "fixture-only";
    process.env.ADMIN_TELEGRAM_CHAT_ID = "fixture-only";
    delete process.env.ADMIN_NTFY_TOPIC; delete process.env.NTFY_TOPIC;
    globalThis.fetch = async (url, options) => {
      assert.equal(String(url), "https://api.telegram.org/botfixture-only/sendMessage");
      messages.push(JSON.parse(String(options?.body)).text);
      return Response.json({ ok: true });
    };
    const draft = { sessionId: "fixture-session", fullName: "Local Fixture", phone: "9900000000", grandTotal: 799, cartSnapshot: [{ name: "Fixture Perfume", quantity: 1, size: "50ml" }] };
    await sendAdminCheckoutDraftAlert({ ...draft, type: "initiated" });
    await sendAdminCheckoutDraftAlert({ ...draft, type: "contact_added" });
    await sendAdminOrderAlert({ orderNumber: "HF-FIXTURE", status: "payment_pending", checkoutChannel: "razorpay", details: { fullName: "Local Fixture" }, cartSnapshot: draft.cartSnapshot.map(item => ({ ...item, price: 799 })) });
    assert.equal(messages.length, 3);
    assert.match(messages[0], /Checkout Initiated/);
    assert.match(messages[1], /Checkout Lead Captured/);
    assert.match(messages[1], /Fixture Perfume/);
    assert.match(messages[2], /awaiting payment/);
    assert.doesNotMatch(messages[2], /New paid/);
  } finally {
    globalThis.fetch = originalFetch;
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});
