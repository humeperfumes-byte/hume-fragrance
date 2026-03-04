import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sitemap.xml", "/fragrance-guides"],
        disallow: ["/_next/image", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/sitemap.xml", "/fragrance-guides"],
        disallow: ["/_next/image", "/api/"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: ["/", "/sitemap.xml", "/fragrance-guides"],
        disallow: ["/_next/image", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/sitemap.xml", "/fragrance-guides"],
        disallow: ["/_next/image", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/sitemap.xml", "/fragrance-guides"],
        disallow: ["/_next/image", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/sitemap.xml", "/fragrance-guides"],
        disallow: ["/_next/image", "/api/"],
      },
    ],
    host: "https://humefragrance.com",
    sitemap: "https://humefragrance.com/sitemap.xml",
  };
}
