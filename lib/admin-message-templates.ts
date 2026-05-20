import { formatINR } from "@/lib/currency";

export type AdminLeadTemplate =
  | "coupon_no_cart"
  | "cart_no_checkout"
  | "checkout_abandoned"
  | "high_value_cart"
  | "repeat_customer";

export type AdminLeadMessageInput = {
  template: AdminLeadTemplate;
  name?: string | null;
  products?: string[];
  couponCode?: string | null;
  value?: number | null;
  checkoutField?: string | null;
  orderCount?: number | null;
  lastOrderNumber?: string | null;
};

function customerName(name: string | null | undefined): string {
  return name?.trim() || "there";
}

function productText(products: string[] | null | undefined): string | null {
  const items = (products || []).filter(Boolean).slice(0, 3);
  if (!items.length) return null;
  return items.join(", ");
}

function optionalValue(value: number | null | undefined): string | null {
  if (!value || value <= 0) return null;
  return formatINR(value);
}

export function buildAdminLeadMessage(input: AdminLeadMessageInput): { subject: string; body: string } {
  const name = customerName(input.name);
  const products = productText(input.products);
  const value = optionalValue(input.value);

  switch (input.template) {
    case "coupon_no_cart":
      return {
        subject: "Your HUME Fragrance coupon is ready",
        body: [
          `Hi ${name},`,
          "",
          input.couponCode
            ? `Your HUME Fragrance coupon code is ${input.couponCode}.`
            : "Your HUME Fragrance coupon is ready.",
          "If you are still choosing a perfume, we can help you pick one based on your taste.",
          "Tell us if you like fresh, sweet, spicy, woody, or long-lasting daily wear scents.",
          "",
          "Team HUME Fragrance",
        ].join("\n"),
      };

    case "cart_no_checkout":
      return {
        subject: "Need help completing your HUME cart?",
        body: [
          `Hi ${name},`,
          "",
          "You had HUME Fragrance perfumes in your cart.",
          products ? `You were interested in: ${products}.` : null,
          value ? `Cart value: ${value}.` : null,
          input.couponCode ? `You can use coupon code ${input.couponCode}.` : null,
          "Would you like help choosing the best scent or completing your order?",
          "",
          "Team HUME Fragrance",
        ]
          .filter(Boolean)
          .join("\n"),
      };

    case "checkout_abandoned":
      return {
        subject: "Complete your HUME Fragrance order",
        body: [
          `Hi ${name},`,
          "",
          "Your HUME order is still saved with us.",
          products ? `You were checking out: ${products}.` : null,
          value ? `Order value: ${value}.` : null,
          input.checkoutField ? `It looks like checkout stopped around: ${input.checkoutField}.` : null,
          "We can help you complete it right away.",
          "",
          "Team HUME Fragrance",
        ]
          .filter(Boolean)
          .join("\n"),
      };

    case "high_value_cart":
      return {
        subject: "Your HUME cart is saved",
        body: [
          `Hi ${name},`,
          "",
          "Your HUME Fragrance cart is saved.",
          products ? `Your selected perfumes: ${products}.` : null,
          value ? `Cart value: ${value}.` : null,
          "For higher value orders, we can personally help you choose the best combination and avoid a wrong blind buy.",
          "Would you like a quick recommendation?",
          "",
          "Team HUME Fragrance",
        ]
          .filter(Boolean)
          .join("\n"),
      };

    case "repeat_customer":
      return {
        subject: "A HUME recommendation for your next order",
        body: [
          `Hi ${name},`,
          "",
          input.orderCount && input.orderCount > 1
            ? `Thank you for ordering from HUME ${input.orderCount} times.`
            : "Thank you for ordering from HUME Fragrance.",
          input.lastOrderNumber ? `Your last order was ${input.lastOrderNumber}.` : null,
          "We can help you pick your next perfume based on what you already liked.",
          "Would you like a recommendation for daily wear, office wear, date night, or gifting?",
          "",
          "Team HUME Fragrance",
        ]
          .filter(Boolean)
          .join("\n"),
      };
  }
}

export function normalizeAdminPhone(phone: string | null | undefined): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildAdminWhatsAppHref(phone: string | null | undefined, input: AdminLeadMessageInput): string {
  const message = encodeURIComponent(buildAdminLeadMessage(input).body);
  const normalizedPhone = normalizeAdminPhone(phone);
  return normalizedPhone ? `https://wa.me/${normalizedPhone}?text=${message}` : `https://wa.me/?text=${message}`;
}

export function buildGmailComposeHref(email: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: subject,
    body,
  });

  return `https://mail.google.com/mail/?${params.toString()}`;
}

export function buildAdminEmailHref(email: string, input: AdminLeadMessageInput): string {
  const message = buildAdminLeadMessage(input);
  return buildGmailComposeHref(email, message.subject, message.body);
}
