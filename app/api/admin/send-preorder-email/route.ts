import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
import { sendHumeEmail } from "@/lib/email/hume-mail-service";

const EMAIL_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Discovery Set - Pre-Order Now</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0A0A0C;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #E2E2E5;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0A0A0C;
      padding: 40px 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #111115;
      border: 1px solid #22222A;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      padding: 40px 0 20px 0;
      text-align: center;
    }
    .logo-text {
      font-family: "Georgia", serif;
      font-size: 28px;
      font-style: italic;
      letter-spacing: 2px;
      color: #D4AF37; /* Gold accent */
      margin: 0;
    }
    .brand-sub {
      font-size: 10px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #8E8E93;
      margin-top: 5px;
    }
    .content {
      padding: 20px 40px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #D4AF37;
      background-color: rgba(212, 175, 55, 0.1);
      padding: 6px 16px;
      border-radius: 100px;
      margin-bottom: 20px;
    }
    .title {
      font-family: "Georgia", serif;
      font-size: 32px;
      line-height: 1.2;
      color: #FFFFFF;
      margin: 0 0 15px 0;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #A1A1AA;
      margin: 0 0 30px 0;
    }
    .pricing-box {
      background-color: #16161D;
      border: 1px solid #2A2A35;
      border-radius: 12px;
      padding: 20px;
      margin: 0 auto 30px auto;
      max-width: 320px;
    }
    .price-label {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #8E8E93;
      margin-bottom: 8px;
    }
    .price-original {
      font-size: 15px;
      color: #8E8E93;
      margin-right: 15px;
    }
    .price-preorder {
      font-size: 24px;
      font-weight: bold;
      color: #D4AF37;
    }
    .cta-button {
      display: inline-block;
      background-color: #D4AF37;
      color: #0A0A0C !important;
      font-size: 11px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 8px;
      transition: background-color 0.2s;
    }
    .footer {
      padding: 40px 20px;
      text-align: center;
      border-top: 1px solid #22222A;
      background-color: #0E0E12;
    }
    .footer-text {
      font-size: 11px;
      line-height: 1.5;
      color: #71717A;
      margin: 0 0 15px 0;
    }
    .footer-links a {
      color: #8E8E93;
      text-decoration: none;
      margin: 0 10px;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Header -->
      <div class="header">
        <p class="logo-text">hf</p>
        <p class="brand-sub">Hume Fragrance</p>
      </div>
      
      <!-- Content Body -->
      <div class="content">
        <span class="badge">Arriving in 10 Days</span>
        <h1 class="title">The Discovery Set</h1>
        <p class="description" style="font-size: 20px; font-weight: 500; color: #FFFFFF; letter-spacing: 1px; margin-bottom: 25px;">
          15 x Tester
        </p>
        
        <!-- Pricing Block -->
        <div class="pricing-box" style="margin-bottom: 35px;">
          <div class="price-label" style="margin-bottom: 12px;">Pre-Order Launch Comparison</div>
          <div style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <span class="price-original">Original Price: ₹900</span>
            <span class="price-preorder">Pre-Order Price: ₹750</span>
          </div>
        </div>
        
        <!-- CTA -->
        <div style="margin-bottom: 20px;">
          <a href="https://www.humefragrance.com/discovery-set/build-your-own-perfume-trial-kit-choose-10-3ml-samples?utm_source=preorder_campaign&utm_medium=email&utm_campaign=discovery_set_launch" class="cta-button">Pre-Order Now</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          &copy; 2026 HUME Fragrance. All rights reserved.<br>
          You are receiving this because you signed up on our store or added items to your cart.
        </p>
        <div class="footer-links">
          <a href="https://www.humefragrance.com/shop?utm_source=preorder_campaign&utm_medium=email&utm_campaign=discovery_set_launch">Shop</a>
          <a href="https://www.humefragrance.com/about?utm_source=preorder_campaign&utm_medium=email&utm_campaign=discovery_set_launch">Our Story</a>
          <a href="https://www.humefragrance.com/unsubscribe?utm_source=preorder_campaign&utm_medium=email&utm_campaign=discovery_set_launch">Unsubscribe</a>
        </div>
      </div>
      
    </div>
  </div>
</body>
</html>`;

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { email, sendToAll } = await request.json();

    if (!sendToAll) {
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid test email address" }, { status: 400 });
      }

      const result = await sendHumeEmail({
        to: email,
        subject: "Pre-Order Now: The Discovery Set is Coming in 10 Days!",
        html: EMAIL_HTML,
        messageType: "admin_message",
      });

      return NextResponse.json({ ok: result.ok, sent: 1 });
    }

    // Broadcast to all checkout leads and completed orders
    const [drafts, completedOrders] = await Promise.all([
      db.select({ email: checkoutDrafts.email }).from(checkoutDrafts),
      db.select({ email: orders.email }).from(orders),
    ]);

    const allEmails = new Set<string>();
    drafts.forEach((d) => {
      const email = d.email?.trim().toLowerCase();
      if (email && email.includes("@")) allEmails.add(email);
    });
    completedOrders.forEach((o) => {
      const email = o.email?.trim().toLowerCase();
      if (email && email.includes("@")) allEmails.add(email);
    });

    const emails = Array.from(allEmails);

    if (emails.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No lead emails found to email" });
    }

    let sentCount = 0;
    for (const toEmail of emails) {
      try {
        const result = await sendHumeEmail({
          to: toEmail,
          subject: "Pre-Order Now: The Discovery Set is Coming in 10 Days!",
          html: EMAIL_HTML,
          messageType: "admin_message",
        });
        if (result.ok) {
          sentCount++;
        }
      } catch (err) {
        console.error(`Failed to send preorder email to ${toEmail}:`, err);
      }
    }

    return NextResponse.json({ ok: true, sent: sentCount, total: emails.length });
  } catch (error) {
    console.error("Admin preorder campaign dispatch error:", error);
    return NextResponse.json({ error: "Failed to dispatch preorder email campaign" }, { status: 500 });
  }
}
