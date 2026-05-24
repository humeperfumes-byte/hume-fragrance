import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { captureStockNotifyRequest } from "@/lib/stock-notify";

const stockNotifySchema = z.object({
  productId: z.string().min(1).max(255),
  productName: z.string().min(1).max(255),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  sourcePath: z.string().max(2048).optional(),
}).refine((data) => Boolean(data.email?.trim() || data.phone?.replace(/\D/g, "").length), {
  message: "Add email or mobile number.",
  path: ["email"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = stockNotifySchema.parse(body);
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    await captureStockNotifyRequest({
      productId: data.productId,
      productName: data.productName,
      email: data.email || null,
      phone: data.phone || null,
      sourcePath: data.sourcePath || request.url,
      ipAddress: forwardedFor?.split(",")[0]?.trim() || realIp || null,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message || "Invalid notify request" },
        { status: 400 },
      );
    }

    console.error("stock notify capture error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to save notify request" },
      { status: 500 },
    );
  }
}
