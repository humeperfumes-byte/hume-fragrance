import { buildOrderConfirmationPreviewHtml } from "./order-confirmation-template";
import { sendHumeEmail } from "./hume-mail-service";

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
    sampleSelections?: Array<{
      id: string;
      name: string;
      inspiration?: string;
    }>;
  }>;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  if (!order.details.email) {
    console.log("No email provided for order", order.orderNumber);
    return false;
  }

  try {
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
      meta: [
        item.size,
        item.isGift ? "Gift" : null,
        item.sampleSelections?.length
          ? `Samples: ${item.sampleSelections.map((selection) => selection.name).join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" | ") || undefined,
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
      supportPhone: "9559024822",
      items,
    });

    const subject = `Order Confirmed: ${order.orderNumber}`;
    const text = [
      `Hi ${order.details.fullName || "there"},`,
      "",
      `Your HUME order ${order.orderNumber} is confirmed.`,
      `Total: Rs. ${Number(order.grandTotal || 0).toFixed(2)}`,
      `Shipping address: ${shippingAddress}`,
      "",
      "Need help? WhatsApp us at 9559024822.",
    ].join("\n");

    const sendResult = await sendHumeEmail({
      to: order.details.email,
      subject,
      text,
      html: html,
      messageType: "order_confirmation",
      relatedType: "order",
      relatedId: order.orderNumber,
      payload: {
        paymentMethod: order.paymentMethod ?? null,
        shippingMethod: order.shippingMethod ?? null,
        itemCount: order.cartSnapshot.length,
      },
    });

    if (!sendResult.sent) {
      console.error("Order confirmation email failed:", sendResult.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}
