import { SITE_URL } from "@/lib/site";

type OrderItem = {
  name: string;
  inspiredBy: string;
  quantity: number;
  price: string;
  imageUrl?: string;
  meta?: string;
};

type OrderConfirmationPreviewData = {
  customerName: string;
  orderId: string;
  orderDate: string;
  paymentMethod: string;
  shippingMethod: string;
  total: string;
  subtotal: string;
  shippingCharge: string;
  tax: string;
  shippingAddress: string;
  supportEmail: string;
  supportPhone: string;
  items: OrderItem[];
  assetBaseUrl?: string;
};

function infoCard(label: string, value: string, icon: string) {
  return `
    <td width="25%" class="mobile-stack mobile-pad mobile-border-none" style="padding:14px 10px;vertical-align:top;border-right:1px dashed #dcc79e;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td width="44" valign="top">
            <div style="width:38px;height:38px;line-height:38px;border:1px solid #1f6a64;border-radius:10px;text-align:center;font-size:19px;color:#1f6a64;">
              ${icon}
            </div>
          </td>
          <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f6a64;font-weight:700;">${label}</div>
            <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#2f3837;margin-top:4px;font-weight:500;">${value}</div>
          </td>
        </tr>
      </table>
    </td>
  `;
}

function whatNextCard(icon: string, copy: string) {
  return `
    <td width="33.33%" class="mobile-stack mobile-pad" style="padding:10px 12px;text-align:center;vertical-align:top;">
      <div style="width:54px;height:54px;line-height:54px;border:1px solid #1f6a64;border-radius:50%;margin:0 auto 12px;font-size:22px;color:#1f6a64;">
        ${icon}
      </div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#33403f;max-width:170px;margin:0 auto;">
        ${copy}
      </div>
    </td>
  `;
}

export function buildOrderConfirmationPreviewHtml(data: OrderConfirmationPreviewData) {
  const assetBaseUrl = data.assetBaseUrl || SITE_URL;
  const heroUrl = `${assetBaseUrl}/images/email/order%20confirmation%20email%20hero%20image.png`;
  const cursiveLogoUrl = `${assetBaseUrl}/images/logo/brown%20cursive%20hf%20png.png`;

  const itemRows = data.items
    .map((item) => {
      const imageUrl = item.imageUrl || `${assetBaseUrl}/images/black-perfume.png`;
      return `
        <tr>
          <td style="padding:14px 18px;border-bottom:1px solid #ead9b8;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="90" valign="top">
                  <img src="${imageUrl}" alt="${item.name}" width="78" height="78" style="display:block;width:78px;height:78px;border-radius:14px;border:1px solid #e3d3b0;object-fit:cover;background:#f6efe1;" />
                </td>
                <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
                  <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:16px;line-height:1.35;color:#1f2f2e;font-weight:600;margin-top:4px;">${item.name}</div>
                  <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#75644e;margin-top:4px;">
                    ${item.meta || `Inspired by ${item.inspiredBy}`}
                  </div>
                </td>
                <td width="120" valign="top" align="right" style="font-family:Arial,Helvetica,sans-serif;">
                  <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:17px;line-height:1.35;color:#1f2f2e;font-weight:600;margin-top:4px;">${item.price}</div>
                  <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#75644e;margin-top:8px;">Qty: ${item.quantity}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HUME Order Confirmed</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      @media only screen and (max-width: 600px) {
        .mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        .mobile-pad { padding: 16px !important; }
        .mobile-center { text-align: center !important; }
        .mobile-border-none { border-right: none !important; border-bottom: 1px dashed #dcc79e !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#fbf5ea;font-family:'Inter',Arial,Helvetica,sans-serif;color:#1f3f3d;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;background:radial-gradient(circle at top,#fffaf2 0%,#fbf5ea 45%,#f7efdf 100%);">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:900px;margin:0 auto;background:transparent;">
            <tr>
              <td style="padding:28px 28px 16px;">
                <div style="text-align:center;">
                  <img src="${cursiveLogoUrl}" alt="HUME monogram" width="170" style="display:block;width:170px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;margin:0 auto -4px;" />
                  <div style="font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:34px;line-height:1.02;color:#1f6a64;margin-top:0;font-weight:500;">HUME Fragrance</div>
                  <div style="margin-top:6px;font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;letter-spacing:0.22em;text-transform:uppercase;color:#7f9d96;">
                    Extrait de Parfum
                  </div>
                  <div style="margin-top:8px;font-size:24px;line-height:1;color:#c89f55;">&#10023;</div>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 0 24px;">
                <img src="${heroUrl}" alt="Order Confirmed" width="900" style="display:block;width:100%;max-width:900px;height:auto;border:0;outline:none;text-decoration:none;" />
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <div style="text-align:center;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:20px;line-height:1.2;color:#1f6a64;margin-bottom:12px;font-weight:500;">
                  <span style="color:#d7b166;">&#9679;</span> YOUR ORDER SUMMARY <span style="color:#d7b166;">&#9679;</span>
                </div>
                <div style="border:1px solid #ecdcbf;border-radius:22px;background:rgba(255,255,255,0.62);box-shadow:0 14px 40px rgba(110,88,52,0.08);overflow:hidden;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding:18px 18px 14px;border-bottom:1px solid #ead9b8;background:rgba(255,255,255,0.3);">
                        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f6a64;font-weight:700;margin-bottom:6px;">Shipping To</div>
                        <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#2f3837;">
                          <strong>${data.customerName}</strong><br />
                          ${data.shippingAddress}
                        </div>
                      </td>
                    </tr>
                    ${itemRows}
                    <tr>
                      <td style="padding:18px 18px 6px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-family:'Inter',Arial,Helvetica,sans-serif;">
                          <tr>
                            <td style="padding:6px 0;color:#2f3837;font-size:15px;">Subtotal</td>
                            <td align="right" style="padding:6px 0;font-family:'Inter',Arial,Helvetica,sans-serif;color:#2f3837;font-size:15px;font-weight:500;">${data.subtotal}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#2f3837;font-size:15px;">Shipping</td>
                            <td align="right" style="padding:6px 0;font-family:'Inter',Arial,Helvetica,sans-serif;color:#1f6a64;font-size:15px;font-weight:600;">${data.shippingCharge}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#2f3837;font-size:15px;">Estimated Tax</td>
                            <td align="right" style="padding:6px 0;font-family:'Inter',Arial,Helvetica,sans-serif;color:#2f3837;font-size:15px;font-weight:500;">${data.tax}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="padding-top:10px;border-top:1px solid #ead9b8;"></td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0 16px;font-family:'Inter',Arial,Helvetica,sans-serif;color:#202726;font-size:18px;font-weight:700;">Total</td>
                            <td align="right" style="padding:8px 0 16px;font-family:'Inter',Arial,Helvetica,sans-serif;color:#1f6a64;font-size:18px;font-weight:700;">${data.total}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <div style="border:1px solid #ecdcbf;border-radius:20px;background:rgba(255,255,255,0.56);padding:12px 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      ${infoCard("Order ID", data.orderId, "&#128203;")}
                      ${infoCard("Order Date", data.orderDate, "&#128197;")}
                      ${infoCard("Payment Method", data.paymentMethod, "&#128179;")}
                      <td width="25%" class="mobile-stack mobile-pad" style="padding:14px 10px;vertical-align:top;">
                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td width="44" valign="top">
                              <div style="width:38px;height:38px;line-height:38px;border:1px solid #1f6a64;border-radius:10px;text-align:center;font-size:19px;color:#1f6a64;">
                                &#128666;
                              </div>
                            </td>
                            <td valign="top" style="font-family:Arial,Helvetica,sans-serif;">
                              <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1f6a64;font-weight:700;">Shipping Method</div>
                              <div style="font-family:'Inter',Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#2f3837;margin-top:4px;font-weight:500;">${data.shippingMethod}</div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <div style="text-align:center;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:20px;line-height:1.2;color:#1f6a64;margin-bottom:12px;font-weight:500;">
                  <span style="color:#d7b166;">&#9679;</span> WHAT HAPPENS NEXT? <span style="color:#d7b166;">&#9679;</span>
                </div>
                <div style="border:1px solid #ecdcbf;border-radius:20px;background:rgba(255,255,255,0.56);padding:12px 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      ${whatNextCard("&#10004;", "We are carefully preparing your order")}
                      ${whatNextCard("&#128666;", "Your order will be shipped soon")}
                      ${whatNextCard("&#128276;", "You'll receive updates at every step")}
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <div style="border-radius:22px;background:#0e6a65;padding:22px 24px;box-shadow:0 16px 40px rgba(19,85,80,0.16);">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="74" valign="top" style="padding-right:16px;">
                        <div style="width:58px;height:58px;line-height:58px;border:1px solid rgba(248,220,147,0.5);border-radius:14px;text-align:center;font-size:28px;color:#f4ce7d;">
                          &#128140;
                        </div>
                      </td>
                      <td valign="top" style="font-family:Arial,Helvetica,sans-serif;color:#f7efe2;">
                        <div style="font-size:18px;line-height:1.55;">We truly appreciate your trust in HUME Fragrance.</div>
                        <div style="font-size:17px;line-height:1.7;opacity:0.96;">Each bottle is crafted with passion and delivered with care.</div>
                        <div style="font-size:18px;line-height:1.6;color:#f4ce7d;font-style:italic;">Stay fragrant, stay unforgettable.</div>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 24px;">
                <div style="border-radius:22px;background:linear-gradient(180deg,#edf3ee 0%,#dde9e4 100%);padding:18px 18px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-family:Arial,Helvetica,sans-serif;color:#1f5d58;">
                    <tr>
                      <td width="33.33%" class="mobile-stack mobile-center" style="padding:12px 8px;vertical-align:top;">
                        <div style="font-size:15px;font-weight:700;margin-bottom:6px;">Need Help?</div>
                        <div style="font-size:14px;line-height:1.55;">We're here for you.</div>
                      </td>
                      <td width="33.33%" class="mobile-stack mobile-center" style="padding:12px 8px;vertical-align:top;">
                        <div style="font-size:15px;font-weight:700;margin-bottom:6px;">Email Us</div>
                        <div style="font-size:14px;line-height:1.55;"><a href="mailto:${data.supportEmail}" style="color:#1f5d58;text-decoration:none;">${data.supportEmail}</a></div>
                      </td>
                      <td width="33.33%" class="mobile-stack mobile-center" style="padding:12px 8px;vertical-align:top;">
                        <div style="font-size:15px;font-weight:700;margin-bottom:6px;">Call Us</div>
                        <div style="font-size:14px;line-height:1.55;"><a href="tel:${data.supportPhone}" style="color:#1f5d58;text-decoration:none;">${data.supportPhone}</a></div>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>



            <tr>
              <td style="background:#0e6a65;padding:14px 20px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#f4f0e8;">
                &copy; 2025 HUME Fragrance. All Rights Reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
