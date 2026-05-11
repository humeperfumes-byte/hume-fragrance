import type { MetadataRoute } from "next";
import { getRequestSiteUrl } from "@/lib/request-site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getRequestSiteUrl();
  const allowRules = ["/"];
  const disallowRules = ["/_next/", "/api/", "/admin", "/checkout"];

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
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
