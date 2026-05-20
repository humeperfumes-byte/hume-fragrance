import { getAllPublicProducts } from "@/lib/db/products";
import { getProductPath } from "@/lib/product-route";
import { SITE_URL, siteUrlForBase } from "@/lib/site";

export const dynamic = "force-dynamic";

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(url?: string) {
  if (!url) return siteUrlForBase(SITE_URL, "/icon.png");
  return url.startsWith("http") ? url : siteUrlForBase(SITE_URL, url);
}

function productType(product: { category: string; gender?: string }) {
  const gender = product.gender ? ` > ${product.gender}` : "";
  return `Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne > ${product.category}${gender}`;
}

export async function GET() {
  const products = await getAllPublicProducts();

  const items = products
    .map((product) => {
      const link = siteUrlForBase(SITE_URL, getProductPath(product));
      const image = absoluteUrl(product.images[0]);
      const availability = product.badges?.soldOut
        ? "out of stock"
        : product.badges?.limitedStock
          ? "limited availability"
          : "in stock";
      const title = `${product.name} Inspired Perfume ${product.size || ""}`.trim();
      const description =
        product.seoDescription ||
        `${product.name} by HUME Fragrance, inspired by ${product.inspiration}.`;

      return `
        <item>
          <g:id>${escapeXml(product.id)}</g:id>
          <g:title>${escapeXml(title)}</g:title>
          <g:description>${escapeXml(description)}</g:description>
          <g:link>${escapeXml(link)}</g:link>
          <g:image_link>${escapeXml(image)}</g:image_link>
          <g:availability>${availability}</g:availability>
          <g:price>${product.price.toFixed(2)} INR</g:price>
          <g:brand>HUME Fragrance</g:brand>
          <g:condition>new</g:condition>
          <g:product_type>${escapeXml(productType(product))}</g:product_type>
          <g:google_product_category>479</g:google_product_category>
          <g:identifier_exists>no</g:identifier_exists>
          <g:shipping>
            <g:country>IN</g:country>
            <g:service>Standard shipping</g:service>
            <g:price>0.00 INR</g:price>
          </g:shipping>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>HUME Fragrance Product Feed</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>Premium inspired perfumes from HUME Fragrance.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    },
  });
}
