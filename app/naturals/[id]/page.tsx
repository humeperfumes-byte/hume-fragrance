import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { NATURALS_PRODUCTS } from "@/lib/naturals-data";
import NaturalProductClient from "./NaturalProductClient";
import { getBreadcrumbSchema } from "@/lib/seo";
import { getRequestSiteUrl } from "@/lib/request-site";
import { siteUrlForBase } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = NATURALS_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return { title: "Product Not Found | HUME Fragrance" };
  }

  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = `${baseUrl}/naturals/${product.id}`;

  return {
    title: `${product.name} | Pure Essential Oil | HUME Fragrance`,
    description: product.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} Essential Oil | HUME Fragrance`,
      description: product.description,
      url: canonicalUrl,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function NaturalProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = NATURALS_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = `${baseUrl}/naturals/${product.id}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: product.name,
      description: product.description,
      image: [product.image],
      sku: `HUME-NAT-${product.id.toUpperCase()}`,
      mpn: `HUME-NAT-${product.id.toUpperCase()}`,
      brand: { "@type": "Brand", name: "HUME Fragrance" },
      category: "Pure Essential Oils, Botanical Extracts",
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: product.price.toFixed(2),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "HUME Fragrance" },
      },
    },
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Naturals", url: `${baseUrl}/naturals` },
      { name: product.name, url: canonicalUrl },
    ]),
  ];

  return (
    <main className="min-h-screen bg-[#FAF9F5] text-stone-900">
      <JsonLd data={jsonLd} />
      <Header />
      
      {/* Spacer to push details below fixed header */}
      <div className="h-16 md:h-20" />
      
      <NaturalProductClient product={product} />
      
      <Footer />
    </main>
  );
}
