"use client";

import { useState } from "react";
import { Check, Copy, MessageSquareText } from "lucide-react";

type TemplateMessage = {
  title: string;
  helper: string;
  tone: string;
  body: string;
};

const templateMessages: TemplateMessage[] = [
  {
    title: "Order Success",
    helper: "Send after manual confirmation or WhatsApp order",
    tone: "text-emerald-300",
    body: [
      "Hello {name},",
      "",
      "Your HUME Fragrance order has been placed successfully.",
      "Order ID: {orderNumber}",
      "Order total: {orderTotal}",
      "",
      "We will start preparing your perfume and share the tracking details once it is dispatched.",
      "",
      "Thank you for choosing HUME Fragrance.",
    ].join("\n"),
  },
  {
    title: "Payment Pending",
    helper: "Use when Razorpay or checkout payment is incomplete",
    tone: "text-amber-300",
    body: [
      "Hello {name},",
      "",
      "Your HUME order is saved, but the payment is still pending.",
      "Order ID: {orderNumber}",
      "",
      "You can complete the payment here: {paymentLink}",
      "",
      "If the amount was deducted from your account, please reply here with a screenshot and we will check it quickly.",
    ].join("\n"),
  },
  {
    title: "Order Cancelled",
    helper: "Use when customer cancels or stock/payment issue blocks order",
    tone: "text-red-300",
    body: [
      "Hello {name},",
      "",
      "Your HUME Fragrance order has been cancelled.",
      "Order ID: {orderNumber}",
      "",
      "If this was cancelled by mistake or you still want the perfumes, reply here and we will help you place the order again.",
      "",
      "Team HUME Fragrance",
    ].join("\n"),
  },
  {
    title: "Incorrect Phone",
    helper: "Use when WhatsApp or call does not connect",
    tone: "text-orange-300",
    body: [
      "Hello {name},",
      "",
      "Your mobile number looks incorrect, so we could not reach you on WhatsApp or phone call.",
      "",
      "Please reply to this email with the correct phone number, or message us directly on WhatsApp at 9559024822.",
      "",
      "Team HUME Fragrance",
    ].join("\n"),
  },
  {
    title: "How Can I Help",
    helper: "Use for new leads, scent quiz, Instagram, or WhatsApp questions",
    tone: "text-sky-300",
    body: [
      "Hello {name},",
      "",
      "How can I help you choose a HUME perfume today?",
      "",
      "You can tell me what type of scent you like:",
      "Fresh, sweet, spicy, woody, floral, office wear, date night, or long-lasting daily wear.",
      "",
      "I will suggest the best option for you.",
    ].join("\n"),
  },
  {
    title: "Dispatch Update",
    helper: "Use after order is packed or ready to ship",
    tone: "text-blue-300",
    body: [
      "Hello {name},",
      "",
      "Your HUME order is packed and moving to dispatch.",
      "Order ID: {orderNumber}",
      "",
      "We will share the tracking link as soon as the parcel is handed over to the courier.",
      "",
      "Team HUME Fragrance",
    ].join("\n"),
  },
  {
    title: "Tracking Shared",
    helper: "Use when courier tracking is available",
    tone: "text-cyan-300",
    body: [
      "Hello {name},",
      "",
      "Your HUME order has been shipped.",
      "Order ID: {orderNumber}",
      "",
      "Track your order here: {trackingLink}",
      "",
      "Please allow some time for the courier tracking page to update.",
      "",
      "Team HUME Fragrance",
    ].join("\n"),
  },
  {
    title: "Delivered Follow-up",
    helper: "Use after delivery for feedback and support",
    tone: "text-violet-300",
    body: [
      "Hello {name},",
      "",
      "Your HUME order shows as delivered.",
      "Order ID: {orderNumber}",
      "",
      "We hope the fragrance feels perfect on skin. If anything needs attention, just reply here and we will help you.",
      "",
      "If you liked the perfume, your feedback would mean a lot to us.",
      "",
      "Team HUME Fragrance",
    ].join("\n"),
  },
  {
    title: "Out Of Stock Alternative",
    helper: "Use when selected perfume is unavailable",
    tone: "text-pink-300",
    body: [
      "Hello {name},",
      "",
      "{productName} is currently out of stock.",
      "",
      "We can suggest a similar HUME perfume with the same scent direction and performance.",
      "Tell us if you want something fresh, sweet, spicy, woody, or office-friendly.",
      "",
      "Team HUME Fragrance",
    ].join("\n"),
  },
];

export function TemplateMessagesPanel() {
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const handleCopy = async (template: TemplateMessage) => {
    await navigator.clipboard.writeText(template.body);
    setCopiedTitle(template.title);
    window.setTimeout(() => setCopiedTitle(null), 1800);
  };

  return (
    <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary/70" />
            <h2 className="text-lg font-semibold text-white">Template Messages</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-white/35">
            Copy-ready replies for daily WhatsApp, email, payment, dispatch, and support work.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
          {templateMessages.length} templates
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {templateMessages.map((template) => {
          const copied = copiedTitle === template.title;

          return (
            <article
              key={template.title}
              className="min-w-0 rounded-2xl border border-white/5 bg-black/20 p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${template.tone}`}>{template.title}</p>
                  <p className="mt-1 text-xs text-white/35">{template.helper}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(template)}
                  className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={`Copy ${template.title} template`}
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="mt-4 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-[#0c0c0c] p-4 text-xs leading-6 text-white/70">
                {template.body}
              </pre>
            </article>
          );
        })}
      </div>
    </section>
  );
}
