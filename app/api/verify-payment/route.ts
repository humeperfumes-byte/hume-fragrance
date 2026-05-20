import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getRequestHost, isRazorpayAllowedHost } from "@/lib/razorpay-domain";

export const runtime = "nodejs";

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayAllowedHost(getRequestHost(request.headers), process.env.RAZORPAY_ALLOWED_HOSTS)) {
      return NextResponse.json(
        { success: false, error: "Online payment is not enabled for this domain" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const data = verifyPaymentSchema.parse(body);
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret is not configured" },
        { status: 500 },
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    if (!signaturesMatch(generatedSignature, data.razorpay_signature)) {
      return NextResponse.json(
        { success: false, error: "Payment signature mismatch" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      payment_id: data.razorpay_payment_id,
      order_id: data.razorpay_order_id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid payment fields" },
        { status: 400 },
      );
    }

    console.error("Razorpay verify payment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
