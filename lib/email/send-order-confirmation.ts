import { Resend } from "resend";
import { buildOrderConfirmationPreviewHtml } from "./order-confirmation-template";

const FROM_EMAIL = "HUME Fragrance <support@humefragrance.com>";

export interface OrderEmailData {
  orderNumber: string;
  paymentMethod?: string | null;
  shippingMethod?: string | null;
  subtotal?: string | number | null;
  shippingFee?: string | number | null;
  grandTotal?: string | number | null;
  details: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  };
  cartSnapshot: Array<{
    id: string;
    name: string;
    inspiration?: string;
    size?: string;
    quantity: number;
    price: number;
    isGift?: boolean;
  }>;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  if (!order.details.email) {
    console.log("No email provided for order", order.orderNumber);
    return false;
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY environment variable.");
      return false;
    }
    const resend = new Resend(resendApiKey);

    const addressParts = [
      order.details.addressLine1,
      order.details.addressLine2,
      order.details.city,
      order.details.state,
      order.details.pincode,
    ].filter(Boolean);
    const shippingAddress = addressParts.join(", ") || "No address provided";

    const items = order.cartSnapshot.map((item) => ({
      name: item.name,
      inspiredBy: item.inspiration || "Original",
      quantity: item.quantity,
      price: `Rs. ${item.price.toFixed(2)}`,
      meta: item.size ? `${item.size}${item.isGift ? ' | Gift' : ''}` : undefined,
      // The template falls back to a default image if imageUrl is undefined
    }));

    // Date formatting (e.g., 01 May 2026)
    const orderDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const html = buildOrderConfirmationPreviewHtml({
      customerName: order.details.fullName || "Valued Customer",
      orderId: order.orderNumber,
      orderDate: orderDate,
      paymentMethod: order.paymentMethod || "Cash on Delivery",
      shippingMethod: order.shippingMethod || "Standard Shipping",
      total: `Rs. ${Number(order.grandTotal || 0).toFixed(2)}`,
      subtotal: `Rs. ${Number(order.subtotal || 0).toFixed(2)}`,
      shippingCharge: order.shippingFee !== undefined && Number(order.shippingFee) === 0 ? "Complimentary" : `Rs. ${Number(order.shippingFee || 0).toFixed(2)}`,
      tax: "Rs. 0.00",
      shippingAddress,
      supportEmail: "support@humefragrance.com",
      supportPhone: "+91 95590 24822",
      items,
    });

    const sendResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: [order.details.email],
      subject: `Order Confirmed: ${order.orderNumber}`,
      html: html,
    });

    if (sendResult?.error) {
      console.error("Resend API error:", sendResult.error);
      return false;
    }

    return Boolean(sendResult?.data?.id);
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}
