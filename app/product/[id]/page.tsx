import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import ProductDetailView from "./ProductDetailView";
import { getRelatedBlogPostsByProductId } from "@/lib/db/blog";
import { getAllPublicProducts, getProductByRouteSegment } from "@/lib/db/products";
import {
  getProductSchema,
  getBreadcrumbSchema,
  getProductFAQSchema,
  getProductReviewSchema,
} from "@/lib/seo";
import { getProductPath, getProductSeoSlug } from "@/lib/product-route";
import {
  getUpcomingProductAsPerfume,
  getUpcomingProductBySlug,
} from "@/lib/upcoming-products";
import { SITE_URL, siteUrlForBase } from "@/lib/site";

export const revalidate = 21600;

export async function generateStaticParams() {
  const products = await getAllPublicProducts();
  return products.map((product) => ({ id: getProductSeoSlug(product) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const perfume = await getProductByRouteSegment(id);

  const baseUrl = SITE_URL;
  if (!perfume) {
    const launchProduct = getUpcomingProductBySlug(id);
    if (!launchProduct) return { title: "Product Not Found" };

    const product = getUpcomingProductAsPerfume(launchProduct);
    const canonicalUrl = siteUrlForBase(baseUrl, launchProduct.path);

    return {
      title: `${launchProduct.name} | HUME Fragrance`,
      description: product.seoDescription,
      keywords: product.seoKeywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${launchProduct.name} | HUME Fragrance`,
        description: product.seoDescription,
        url: canonicalUrl,
        images: product.images?.[0] ? [siteUrlForBase(baseUrl, product.images[0])] : [],
      },
    };
  }

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

  if (!perfume) {
    const launchProduct = getUpcomingProductBySlug(id);
    if (!launchProduct) notFound();

    const liveProduct = getUpcomingProductAsPerfume(launchProduct);
    const baseUrl = SITE_URL;
    const canonicalUrl = siteUrlForBase(baseUrl, launchProduct.path);
    const jsonLd = [
      getProductSchema(liveProduct, baseUrl),
      getProductFAQSchema(liveProduct),
      getBreadcrumbSchema([
        { name: "Home", url: baseUrl },
        { name: "Shop", url: `${baseUrl}/shop` },
        { name: liveProduct.name, url: canonicalUrl },
      ]),
    ];

    return (
      <main className="bg-background min-h-screen">
        <JsonLd data={jsonLd} />
        <Header />
        <ProductDetailView
          perfume={liveProduct}
          relatedBlogs={[]}
          priceLabel={launchProduct.priceLabel}
          faqItems={launchProduct.faq}
        />
        <Footer />
      </main>
    );
  }

  const seoSlug = getProductSeoSlug(perfume);
  if (id !== seoSlug) {
    redirect(getProductPath(perfume));
  }

  const relatedBlogs = await getRelatedBlogPostsByProductId(perfume.id, 3);
  const baseUrl = SITE_URL;

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
