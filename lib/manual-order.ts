import { z } from "zod";

export const MANUAL_LINK_CHANNEL = "manual_payment_link";
export const manualOrderSchema = z.object({
  requestId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(255),
  phone: z.string().trim().regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"),
  email: z.union([z.string().trim().email(), z.literal("")]).optional(),
  addressLine1: z.string().trim().min(5).max(1000),
  addressLine2: z.string().trim().max(1000).optional(),
  city: z.string().trim().min(2).max(255), state: z.string().trim().min(2).max(255),
  pincode: z.string().regex(/^[1-9]\d{5}$/), notes: z.string().trim().max(2000).optional(),
  items: z.array(z.object({ id: z.string().min(1).max(255), quantity: z.number().int().min(1).max(20) })).min(1).max(20),
  shippingFee: z.number().min(0).max(10000).default(0),
  discount: z.number().min(0).max(100000).default(0),
  adjustmentReason: z.string().trim().max(500).optional(),
  paymentMode: z.enum(["full", "partial_cod"]),
}).strict();

export function manualPaymentAmounts(totalMinor: number, mode: "full" | "partial_cod") {
  if (!Number.isSafeInteger(totalMinor) || totalMinor < 100 || totalMinor > 100000000) throw new Error("Order total must be between ₹1 and ₹10,00,000");
  const advanceMinor = mode === "partial_cod" ? Math.round(totalMinor * 0.2) : totalMinor;
  if (advanceMinor < 100) throw new Error("Online payment must be at least ₹1");
  return { totalMinor, advanceMinor, codMinor: totalMinor - advanceMinor, mode };
}

export type ManualPayment = ReturnType<typeof manualPaymentAmounts> & { linkId?: string; url?: string; requestFingerprint?: string };
const MARKER = "HUME manual payment: ";
export function readManualPayment(message: string | null | undefined): ManualPayment | null {
  const line = message?.split("\n").find(line => line.startsWith(MARKER));
  if (!line) return null;
  try {
    const value = JSON.parse(line.slice(MARKER.length));
    const expected = manualPaymentAmounts(value.totalMinor, value.mode);
    if (!["full", "partial_cod"].includes(value.mode) || value.advanceMinor !== expected.advanceMinor || value.codMinor !== expected.codMinor) return null;
    if (value.linkId !== undefined && (typeof value.linkId !== "string" || !/^plink_[a-zA-Z0-9]+$/.test(value.linkId))) return null;
    if (value.url !== undefined && (typeof value.url !== "string" || !/^https:\/\/(rzp\.io|rzp\.in|razorpay\.com)\//.test(value.url))) return null;
    return value as ManualPayment;
  } catch { return null; }
}
export function writeManualPayment(message: string | null | undefined, payment: ManualPayment) {
  const rest = (message ?? "").split("\n").filter(line => !line.startsWith(MARKER)).join("\n").trim();
  return `${MARKER}${JSON.stringify(payment)}${rest ? `\n${rest}` : ""}`;
}

export function validateManualLink(payment: ManualPayment, link: { amount: unknown; amount_paid: unknown; currency?: string; reference_id?: string; status: string }, orderId: string) {
  if (link.reference_id !== orderId || link.currency !== "INR" || Number(link.amount) !== payment.advanceMinor) throw new Error("Razorpay link does not match the order");
  if (link.status === "paid" && Number(link.amount_paid) !== payment.advanceMinor) throw new Error("Razorpay received amount does not match the expected online payment");
  return link.status === "paid" && Number(link.amount_paid) === payment.advanceMinor;
}

export function manualPaymentNextStatus(status: string, paid: boolean) {
  return paid && ["payment_pending", "payment_authorized", "payment_failed", "whatsapp_initiated"].includes(status) ? "processing" : status;
}

export function isManualPaymentEvent(event: string) {
  return ["payment_link.paid", "payment_link.expired", "payment_link.cancelled", "payment.authorized", "payment.captured", "payment.failed", "order.paid"].includes(event);
}
