import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/db/products";
import { getAllBlogPosts } from "@/lib/db/blog";
import { getAllAccessories } from "@/lib/db/accessories";
import { getProgrammaticSitemapEntries } from "@/lib/programmatic-seo";
import { getProductPath } from "@/lib/product-route";
import { getFestivalSeoSlugs } from "@/lib/festival-seo";
import { getRequestSiteUrl } from "@/lib/request-site";
import { AI_RECOMMENDATION_PAGES } from "@/lib/ai-recommendation-pages";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";
import { DETAIL_UPCOMING_PRODUCTS } from "@/lib/upcoming-products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getRequestSiteUrl();
  const [products, blogPosts, accessories] = await Promise.all([
    getAllProducts(),
    getAllBlogPosts(),
    getAllAccessories(),
  ]);

  const productEntries = products.map((product) => ({
    url: `${baseUrl}${getProductPath(product)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const accessoryEntries = accessories.map((item) => ({
    url: `${baseUrl}/accessory/${item.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const programmaticEntries = getProgrammaticSitemapEntries(baseUrl);
  const festivalSeoEntries = getFestivalSeoSlugs().map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  const recommendationEntries = AI_RECOMMENDATION_PAGES.map((page) => ({
    url: `${baseUrl}/recommendations/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));
  const upcomingProductEntries = DETAIL_UPCOMING_PRODUCTS.map((product) => ({
    url: `${baseUrl}${product.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.68,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hume-special`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bestseller`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/llms-full.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/product-feed.xml`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refill-subscription`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fragrance-guides`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/celebrities-favorites`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kit-pack`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${DISCOVERY_SET_PATH}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.78,
    },
    {
      url: `${baseUrl}/scent-quiz`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/return-refund-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...productEntries,
    ...accessoryEntries,
    ...blogEntries,
    ...programmaticEntries,
    ...festivalSeoEntries,
    ...recommendationEntries,
    ...upcomingProductEntries,
  ];
}
