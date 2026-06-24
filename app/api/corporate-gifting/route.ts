import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { captureCorporateGiftingLead } from "@/lib/corporate-gifting";
import { sendHumeEmail, isHumeMailConfigured } from "@/lib/email/hume-mail-service";

const corporateGiftingSchema = z.object({
  companyName: z.string().min(1, "Company name is required.").max(255),
  contactName: z.string().min(1, "Contact name is required.").max(255),
  email: z.string().email("Invalid email address.").max(255),
  phone: z.string().min(5, "Phone number must be at least 5 digits.").max(50),
  estimatedQuantity: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? null : parsed;
  }, z.number().nullable().optional()),
  customizationDetails: z.string().max(2048).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Captured B2B Lead request body:", body);
    const data = corporateGiftingSchema.parse(body);

    // Save lead to database
    await captureCorporateGiftingLead({
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      estimatedQuantity: data.estimatedQuantity,
      customizationDetails: data.customizationDetails,
    });

    // Send transactional notification email if configured
    if (isHumeMailConfigured()) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #1a1a1a; border-bottom: 2px solid #b45309; padding-bottom: 10px; font-family: Georgia, serif; font-weight: normal;">New B2B Corporate Gifting Lead</h2>
          <p>We have received a new corporate gifting inquiry. Below are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; width: 180px; color: #555;">Company Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #111;">${data.companyName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; color: #555;">Contact Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #111;">${data.contactName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; color: #555;">Email Address:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #111;"><a href="mailto:${data.email}" style="color: #b45309; text-decoration: underline;">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; color: #555;">Phone Number:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #111;"><a href="tel:${data.phone}" style="color: #b45309; text-decoration: underline;">${data.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; color: #555;">Estimated Quantity:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #111;">${data.estimatedQuantity ?? "Not specified"} units</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6; color: #555; vertical-align: top;">Customization Details:</td>
              <td style="padding: 10px; border-bottom: 1px solid #f3f4f6; color: #111; white-space: pre-wrap;">${data.customizationDetails ?? "None"}</td>
            </tr>
          </table>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <a href="https://wa.me/91${data.phone.replace(/\D/g, "")}" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">WhatsApp Client</a>
          </div>
        </div>
      `;

      try {
        await sendHumeEmail({
          to: "humeperfumes@gmail.com",
          subject: `💼 New B2B Lead: ${data.companyName} (${data.contactName})`,
          html: emailHtml,
          messageType: "admin_message",
        });
      } catch (emailError) {
        console.error("Failed to send B2B lead notification email:", emailError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Schema Validation Failure:", error.errors);
      return NextResponse.json(
        { ok: false, error: error.issues[0]?.message || "Invalid B2B lead data" },
        { status: 400 },
      );
    }

    console.error("Corporate gifting lead capture error:", error);
    return NextResponse.json(
      { ok: false, error: "Unable to submit your corporate gifting request." },
      { status: 500 },
    );
  }
}