import { NextRequest, NextResponse } from "next/server";
import { buildOrderConfirmationPreviewHtml } from "@/lib/email/order-confirmation-template";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = new URL(request.url).origin;

  const html = buildOrderConfirmationPreviewHtml({
    customerName: searchParams.get("name") || "Athens Dubey",
    orderId: searchParams.get("orderId") || "HF-2026-1048",
    orderDate: searchParams.get("date") || "01 May 2026",
    paymentMethod: searchParams.get("payment") || "Cash on Delivery",
    shippingMethod: searchParams.get("shipping") || "Standard Shipping",
    total: searchParams.get("total") || "Rs. 1,598",
    subtotal: searchParams.get("subtotal") || "Rs. 1,598",
    shippingCharge: searchParams.get("shippingCharge") || "Complimentary",
    tax: searchParams.get("tax") || "Rs. 0",
    shippingAddress:
      searchParams.get("address") ||
      "Athens Dubey, Kannauj, Uttar Pradesh 209725",
    supportEmail: "support@humefragrance.com",
    supportPhone: "9559024822",
    assetBaseUrl: origin,
    items: [
      {
        name: "Hawas",
        inspiredBy: "Rasasi Hawas",
        quantity: 1,
        price: "Rs. 799",
        imageUrl: `${origin}/images/perfume-1.jpg`,
        meta: "30ml | Fresh Aquatic",
      },
      {
        name: "Ombre Leather",
        inspiredBy: "Tom Ford Ombre Leather",
        quantity: 1,
        price: "Rs. 799",
        imageUrl: `${origin}/images/perfume-2.jpg`,
        meta: "30ml | Leather Smoky",
      },
    ],
  });

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
