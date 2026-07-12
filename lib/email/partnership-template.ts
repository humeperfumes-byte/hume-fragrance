import { SITE_URL } from "../site";

export interface PartnershipEmailParams {
  storeName: string;
  recipientName: string;
  location: string;
  senderName: string;
  senderTitle: string;
  senderEmail: string;
  introHook?: string;
  uspParagraph?: string;
  cta?: string;
  assetBaseUrl?: string;
}

export function buildPartnershipEmailHtml(params: PartnershipEmailParams): string {
  const {
    storeName,
    recipientName,
    location,
    senderName,
    senderTitle,
    senderEmail,
    introHook = `I hope this email finds you well. I have been following ${storeName}'s exceptional selection of niche luxury goods in ${location}, and I believe our artisanal fragrance collection would be a magnificent fit for your shelves.`,
    uspParagraph = `HUME Fragrance is a modern haute perfumery. We formulate high-concentration extraits de parfum (30%+ oil concentration) inspired by master blending techniques, yielding exceptional 12+ hour longevity and projection. Our bottles are housed in custom, sleek glass silhouettes designed to elevate premium retail environments.`,
    cta = `We would love to send a complimentary Discovery Kit containing our signature scents directly to your curation team. Alternatively, would you be open to a brief 10-minute video introduction next week?`,
    assetBaseUrl = SITE_URL,
  } = params;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Partnership Discussion: HUME Fragrance x ${storeName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #FAFAFA;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
    }
    a {
      text-decoration: none;
    }
    .wrapper {
      width: 100%;
      background-color: #FAFAFA;
      padding: 40px 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EDEDED;
      border-radius: 12px;
      overflow: hidden;
    }
    .content-area {
      padding: 40px 48px;
    }
    .footer {
      background-color: #1A1A1A;
      padding: 40px 48px;
      text-align: center;
    }
    @media only screen and (max-width: 600px) {
      .content-area {
        padding: 30px 24px !important;
      }
      .footer {
        padding: 30px 24px !important;
      }
      .product-table td {
        display: block !important;
        width: 100% !important;
        margin-bottom: 16px !important;
      }
      .product-table td.spacer {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Brand Header -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0 24px 0; border-bottom: 1px solid #FAFAFA;">
            <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 8px; text-transform: uppercase; color: #1A1A1A; margin-bottom: 6px; line-height: 1.2;">H U M E</div>
            <div style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 5px; text-transform: uppercase; color: #8E8E93; line-height: 1;">F R A G R A N C E</div>
          </td>
        </tr>
      </table>

      <!-- Main Content Block -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td class="content-area">
            
            <!-- Salutation & Hook -->
            <p style="font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.6; color: #1A1A1A; font-weight: 500; margin: 0 0 16px 0;">
              Dear ${recipientName || 'Partner'},
            </p>
            
            <p style="font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.65; color: #4A4A4A; margin: 0 0 24px 0;">
              ${introHook}
            </p>
            
            <!-- Hero Image Banner -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
              <tr>
                <td>
                  <img src="${assetBaseUrl}/images/collection-hero.png" alt="Hume Fragrance Presentation" width="504" style="width: 100%; max-width: 504px; height: auto; border-radius: 8px;" />
                </td>
              </tr>
            </table>

            <!-- Value Proposition -->
            <p style="font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.65; color: #4A4A4A; margin: 0 0 28px 0;">
              ${uspParagraph}
            </p>



            <!-- Benefits List -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
              <tr>
                <td style="background-color: #FAF8F5; border-left: 3px solid #C5A880; padding: 20px 24px; border-radius: 0 8px 8px 0;">
                  <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 600; color: #1A1A1A; margin-bottom: 12px;">Retailer Collaboration Benefits:</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td valign="top" style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.7; color: #4A4A4A; padding-bottom: 6px;">
                        • <strong>Exceptional Margins:</strong> Up to 50% wholesale margins to optimize return on counter space.
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.7; color: #4A4A4A; padding-bottom: 6px;">
                        • <strong>Elite Longevity:</strong> Extraits de Parfum (30%+ formulation) ensuring true 12+ hour performance.
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.7; color: #4A4A4A; padding-bottom: 6px;">
                        • <strong>Complete Merchandising:</strong> Full acrylic testers, display materials, and retail sample sets included.
                      </td>
                    </tr>
                    <tr>
                      <td valign="top" style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.7; color: #4A4A4A;">
                        • <strong>Global Shipping:</strong> Streamlined delivery and localized customs clearance support.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Call to Action Text -->
            ${cta ? `
            <p style="font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.65; color: #4A4A4A; margin: 0 0 32px 0;">
              ${cta}
            </p>
            ` : ''}

            <!-- Signature -->
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-family: 'Inter', sans-serif; font-size: 13px; line-height: 1.5; color: #4A4A4A;">
                  Warm regards,<br /><br />
                  ${senderName ? `<strong style="color: #1A1A1A; font-size: 14px;">${senderName}</strong><br />` : ''}
                  ${senderTitle ? `<span style="color: #8E8E93; font-size: 12px;">${senderTitle}</span><br />` : ''}
                  <span style="color: #8E8E93; font-size: 12px;">HUME Fragrance</span>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

      <!-- Footer Panel -->
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td class="footer">
            <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-style: italic; color: #C5A880; margin-bottom: 12px;">HUME Fragrance</div>
            <p style="font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.6; color: #8E8E93; margin: 0 0 16px 0;">
              &copy; 2026 HUME Fragrance. All rights reserved.<br />
              This is a private partnership inquiry intended for store buyers and managers.
            </p>
            <div style="font-family: 'Inter', sans-serif; font-size: 11px; letter-spacing: 1px;">
              <a href="https://www.humefragrance.com" style="color: #FFFFFF; text-decoration: none; margin: 0 10px;">Website</a>
              <span style="color: #4A4A4A;">|</span>
              <a href="https://www.instagram.com/humefragrance" style="color: #FFFFFF; text-decoration: none; margin: 0 10px;">Instagram</a>
              <span style="color: #4A4A4A;">|</span>
              <a href="mailto:support@humefragrance.com" style="color: #FFFFFF; text-decoration: none; margin: 0 10px;">Contact Support</a>
            </div>
          </td>
        </tr>
      </table>

    </div>
  </div>
</body>
</html>`;
}

export function buildPartnershipEmailText(params: PartnershipEmailParams): string {
  const {
    storeName,
    recipientName,
    location,
    senderName,
    senderTitle,
    introHook = `I hope this email finds you well. I have been following ${storeName}'s exceptional selection of niche luxury goods in ${location}, and I believe our fragrance collection would be a magnificent fit for your shelves.`,
    uspParagraph = `HUME Fragrance is a modern haute perfumery. We formulate high-concentration extraits de parfum (30%+ oil concentration) yielding exceptional 12+ hour longevity and projection. Our bottles are housed in custom, sleek glass silhouettes designed to elevate premium retail environments.`,
    cta = `We would love to send a complimentary Discovery Kit containing our signature scents directly to your curation team. Alternatively, would you be open to a brief 10-minute video introduction next week?`,
  } = params;

  return [
    `HUME FRAGRANCE - PARTNERSHIP PROPOSAL`,
    `=====================================`,
    ``,
    `Dear ${recipientName || "Partner"},`,
    ``,
    introHook,
    ``,
    uspParagraph,
    ``,
    `Retailer Collaboration Benefits:`,
    `- Exceptional Margins: Up to 50% wholesale margins to optimize return on counter space.`,
    `- Elite Longevity: Extraits de Parfum (30%+ formulation) ensuring true 12+ hour performance.`,
    `- Complete Merchandising: Full acrylic testers, display materials, and retail sample sets included.`,
    `- Global Shipping: Streamlined delivery and localized customs clearance support.`,
    ``,
    cta,
    ``,
    `Warm regards,`,
    ``,
    ...(senderName ? [senderName] : []),
    ...(senderTitle ? [senderTitle] : []),
    `HUME Fragrance`,
    `https://www.humefragrance.com`,
  ].join("\n");
}
