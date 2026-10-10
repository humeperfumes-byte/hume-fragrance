import "server-only";
import { createHmac } from "node:crypto";

/** Stable across instances; never expose this module or its result to the browser. */
export function checkoutSigningSecret(): string | undefined {
  if (process.env.CHECKOUT_SESSION_SIGNING_SECRET) return process.env.CHECKOUT_SESSION_SIGNING_SECRET;
  const paymentSecret = process.env.RAZORPAY_KEY_SECRET;
  return paymentSecret ? createHmac("sha256", paymentSecret).update("HUME:visit-reward:signing:v1").digest("hex") : undefined;
}
