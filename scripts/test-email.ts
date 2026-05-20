import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env", override: false });

import { sendOrderConfirmationEmail, OrderEmailData } from "../lib/email/send-order-confirmation";

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address! Usage: npx tsx scripts/test-email.ts <your-email>");
    process.exit(1);
  }

  const dummyData: OrderEmailData = {
    orderNumber: "TEST-2026-9999",
    paymentMethod: "UPI",
    shippingMethod: "Express Shipping",
    subtotal: "1598.00",
    shippingFee: "0.00",
    grandTotal: "1598.00",
    details: {
      fullName: "Test User",
      email: email,
      phone: "+91 9876543210",
      addressLine1: "123 Test Street",
      addressLine2: "Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
    },
    cartSnapshot: [
      {
        id: "prod_1",
        name: "Hawas",
        inspiration: "Rasasi Hawas",
        size: "30ml",
        quantity: 1,
        price: 799,
        isGift: false,
      },
      {
        id: "prod_2",
        name: "Ombre Leather",
        inspiration: "Tom Ford Ombre Leather",
        size: "30ml",
        quantity: 1,
        price: 799,
        isGift: false,
      }
    ],
  };

  console.log(`Sending test email to ${email}...`);
  const success = await sendOrderConfirmationEmail(dummyData);
  
  if (success) {
    console.log("✅ Email sent successfully! Check your inbox.");
  } else {
    console.log("❌ Failed to send email. Check console for details.");
  }
}

run();
