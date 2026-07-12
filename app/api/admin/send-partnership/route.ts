import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { sendHumeEmail } from "@/lib/email/hume-mail-service";
import { buildPartnershipEmailHtml } from "@/lib/email/partnership-template";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      toEmail,
      subject,
      senderEmail,
      senderName,
      senderTitle,
      storeName,
      recipientName,
      location,
      introHook,
      uspParagraph,
      cta,
    } = body;

    // Validation
    if (!toEmail || !toEmail.includes("@")) {
      return NextResponse.json({ error: "Invalid recipient email address" }, { status: 400 });
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Subject line is required" }, { status: 400 });
    }
    if (!storeName || !storeName.trim()) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }

    const html = buildPartnershipEmailHtml({
      storeName,
      recipientName: recipientName || "Partner",
      location: location || "Foreign Market",
      senderName: senderName || "",
      senderTitle: senderTitle || "",
      senderEmail: senderEmail || "support@humefragrance.com",
      introHook: introHook || undefined,
      uspParagraph: uspParagraph || undefined,
      cta: cta || undefined,
    });

    const result = await sendHumeEmail({
      to: toEmail.trim(),
      subject: subject.trim(),
      html,
      messageType: "partnership_pitch",
      from: senderEmail ? senderEmail.trim() : undefined,
    });

    return NextResponse.json({
      ok: result.ok,
      sent: result.sent,
      status: result.status,
      eventId: result.eventId,
      error: result.error,
    });
  } catch (error: any) {
    console.error("Admin partnership email sending error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch partnership email" },
      { status: 500 }
    );
  }
}
