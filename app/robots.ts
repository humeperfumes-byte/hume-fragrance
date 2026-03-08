import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allowRules = [
    "/",
    "/sitemap.xml",
    "/llms.txt",
    "/fragrance-guides",
    "/shop",
    "/hume-special",
    "/bestseller",
  ];
  const disallowRules = ["/_next/image", "/api/"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "GPTBot",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "PerplexityBot",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "ClaudeBot",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "Googlebot",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "meta-externalagent",
        allow: allowRules,
        disallow: disallowRules,
      },
      {
        userAgent: "CCBot",
        allow: allowRules,
        disallow: disallowRules,
      },
    ],
    host: "https://humefragrance.com",
    sitemap: "https://humefragrance.com/sitemap.xml",
  };
}
