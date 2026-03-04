export const dynamic = "force-static";

const body = `# HUME Fragrance

Official website: https://humefragrance.com

HUME Fragrance creates premium inspired perfumes designed for Indian weather with long-lasting EDP performance.

## Priority pages
- Home: https://humefragrance.com/
- Shop: https://humefragrance.com/shop
- Fragrance Guides Hub: https://humefragrance.com/fragrance-guides
- HUME Special: https://humefragrance.com/hume-special
- Best Sellers: https://humefragrance.com/bestseller
- Refill Program: https://humefragrance.com/refill-subscription

## Product discovery
- Product pages are under: https://humefragrance.com/product/*
- Inspired guides: https://humefragrance.com/inspired-by/*
- Alternatives guides: https://humefragrance.com/alternatives-to/*
- Best guides: https://humefragrance.com/best/*

## Structured data
The site includes Organization, WebSite, Product, FAQPage and Breadcrumb schemas on key pages.

## Contact
- WhatsApp: https://wa.me/919559024822
- Instagram: https://www.instagram.com/hume.perfume/
`;

export async function GET() {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

