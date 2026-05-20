import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";
import { getRequestHost, isRazorpayAllowedHost } from "@/lib/razorpay-domain";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  amount: z.number().int().min(100),
  currency: z.string().length(3).default("INR"),
  receipt: z.string().min(1).max(40),
  notes: z
    .object({
      humeOrderId: z.string().max(255).optional(),
      humeOrderNumber: z.string().max(50).optional(),
      checkoutSessionId: z.string().max(255).optional(),
      checkoutUrl: z.string().max(2048).optional(),
    })
    .optional(),
});

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function getErrorStatus(error: unknown) {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
      ? error.statusCode
      : 500;

  return statusCode === 401 ? 401 : 500;
}

export async function POST(request: NextRequest) {
  try {
    if (!isRazorpayAllowedHost(getRequestHost(request.headers), process.env.RAZORPAY_ALLOWED_HOSTS)) {
      return NextResponse.json(
        {
          error: "Online payment is not enabled for this domain. Please use WhatsApp checkout.",
          code: "RAZORPAY_DOMAIN_NOT_ALLOWED",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const data = createOrderSchema.parse(body);
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      notes: data.notes,
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order request", issues: error.flatten() },
        { status: 400 },
      );
    }

    const status = getErrorStatus(error);
    console.error("Razorpay create order error:", error);
    return NextResponse.json(
      {
        error:
          status === 401
            ? "Online payment is temporarily unavailable. Please use WhatsApp checkout."
            : "Failed to create Razorpay order",
        code:
          status === 401
            ? "RAZORPAY_AUTH_FAILED"
            : "RAZORPAY_CREATE_ORDER_FAILED",
      },
      { status },
    );
  }
}
