export function buildAccountOtpEmail(input: {
  otp: string;
  customerName?: string | null;
  expiresInMinutes: number;
}) {
  const name = input.customerName?.trim() || "there";

  const text = [
    `Hi ${name},`,
    "",
    `Your HUME account login code is ${input.otp}.`,
    `This code expires in ${input.expiresInMinutes} minutes.`,
    "",
    "If this was not you, you can safely ignore this email.",
    "Team HUME Fragrance",
  ].join("\n");

  const html = `
    <div style="margin:0;padding:32px;background:#f6f3ef;font-family:Montserrat,Arial,sans-serif;color:#111;">
      <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e7e0d8;border-radius:24px;padding:32px;">
        <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8a8178;">HUME Account</p>
        <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:400;line-height:1.1;">Your login code</h1>
        <p style="margin:18px 0 0;font-size:15px;line-height:1.7;color:#5f5851;">Hi ${name}, use this one-time code to open your HUME account, order history, and tracking details.</p>
        <div style="margin:28px 0;padding:20px;border-radius:18px;background:#111;color:#fff;text-align:center;font-size:34px;letter-spacing:0.3em;font-weight:700;">${input.otp}</div>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#6f665e;">This code expires in ${input.expiresInMinutes} minutes. If you did not request it, ignore this email.</p>
      </div>
    </div>
  `;

  return { html, text };
}
