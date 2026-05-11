import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import ProductDetailView from "./ProductDetailView";
import { getRelatedBlogPostsByProductId } from "@/lib/db/blog";
import { getProductByRouteSegment } from "@/lib/db/products";
import {
  getProductSchema,
  getBreadcrumbSchema,
  getProductFAQSchema,
  getProductReviewSchema,
} from "@/lib/seo";
import { getProductPath, getProductSeoSlug } from "@/lib/product-route";
import { getRequestSiteUrl } from "@/lib/request-site";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const perfume = await getProductByRouteSegment(id);
  if (!perfume) return { title: "Product Not Found" };

  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = `${baseUrl}${getProductPath(perfume)}`;

  return {
    title: `${perfume.name} - ${perfume.inspirationBrand} ${perfume.inspiration} Inspired Perfume`,
    description: perfume.seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${perfume.name} | HUME Fragrance`,
      description: perfume.seoDescription,
      url: canonicalUrl,
      images: perfume.images?.[0] ? [perfume.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfume = await getProductByRouteSegment(id);

  if (!perfume) notFound();

  const seoSlug = getProductSeoSlug(perfume);
  if (id !== seoSlug) {
    redirect(getProductPath(perfume));
  }

  const relatedBlogs = await getRelatedBlogPostsByProductId(perfume.id, 3);
  const baseUrl = await getRequestSiteUrl();

  const productJsonLd = [
    getProductSchema(perfume, baseUrl),
    getProductFAQSchema(perfume),
    getProductReviewSchema(perfume, baseUrl),
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Shop", url: `${baseUrl}/shop` },
      { name: perfume.name, url: `${baseUrl}${getProductPath(perfume)}` },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={productJsonLd} />
      <Header />
      <ProductDetailView perfume={perfume} relatedBlogs={relatedBlogs} />
      <Footer />
    </main>
  );
}
