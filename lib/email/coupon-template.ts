import { SITE_URL } from "../site";

export function buildCouponEmailSubject(couponCode: string) {
  return `Your HUME early bird code: ${couponCode}`;
}

export function buildCouponEmailText(couponCode: string) {
  return [
    "HUME FRAGRANCE",
    "",
    "Your early bird code is ready.",
    "",
    `Coupon Code: ${couponCode}`,
    "",
    "Use this code at checkout to unlock 10% off your order.",
    "",
    "Need help choosing a scent?",
    "WhatsApp: 9559024822",
  ].join("\n");
}

export function buildCouponEmailHtml(couponCode: string, recipientEmail: string) {
  const guessedName = recipientEmail.split("@")[0]?.replace(/[._-]+/g, " ");
  const greetingName =
    guessedName && guessedName.length > 1
      ? guessedName
          .split(" ")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "there";
  const heroImageUrl = `${SITE_URL}/images/email/b3g1_image.png`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your HUME Starting Code</title>
  </head>
  <body style="margin:0;padding:0;background:#141414;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#141414;margin:0;padding:0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:760px;background:#141414;margin:0;">
            <tr>
              <td style="padding:0;background:#141414;color:#ffffff;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:16px 16px 0;">
                      <img src="https://www.humefragrance.com/images/logo.png?v=3" alt="HUME Fragrance" width="44" height="44" style="display:block;border:0;outline:none;text-decoration:none;border-radius:10px;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px 18px;background:#141414;">
                      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;opacity:0.85;">Hume Fragrance</p>
                      <img src="${heroImageUrl}" alt="HUME early bird offer" width="680" style="display:block;width:100%;max-width:680px;height:auto;border:0;outline:none;text-decoration:none;border-radius:12px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 16px 10px;background:#141414;">
                <p style="margin:0 0 12px;font-size:30px;line-height:1.15;font-weight:300;color:#ffffff;">Hi ${greetingName},</p>
                <p style="margin:0 0 16px;font-size:18px;line-height:1.6;color:#d6d2cb;">Use this code during checkout to activate your early bird 10% offer.</p>
                <div style="margin:0 0 18px;padding:18px 16px;border:1px dashed rgba(255,255,255,0.3);border-radius:14px;background:rgba(255,255,255,0.04);text-align:center;">
                  <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#d8d1c3;">Coupon Code</p>
                  <p style="margin:0;font-size:34px;letter-spacing:0.2em;font-weight:700;color:#ffffff;">${couponCode}</p>
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 14px;">
                  <tr>
                    <td>
                      <a href="https://www.humefragrance.com/checkout" style="display:inline-block;padding:13px 24px;border-radius:12px;background:#262626;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Use At Checkout</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#d6d2cb;">Need help selecting your fragrance?</p>
                <p style="margin:0;font-size:14px;">
                  <a href="https://wa.me/919559024822" style="color:#ffffff;text-decoration:none;font-weight:600;">WhatsApp us: 9559024822</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 16px 20px;border-top:1px solid rgba(255,255,255,0.1);background:#141414;">
                <p style="margin:0;font-size:12px;color:#9f998f;">This is an automated coupon email from HUME Fragrance.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
