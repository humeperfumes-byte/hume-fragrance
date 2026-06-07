import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getAccessoryById } from "@/lib/db/accessories";
import AccessoryDetailClient from "./AccessoryDetailClient";
import { getRequestSiteUrl } from "@/lib/request-site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const accessory = await getAccessoryById(id);
  if (!accessory) return { title: "Accessory Not Found" };
  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = `${baseUrl}/accessory/${accessory.id}`;
  return {
    title: `${accessory.name} | HUME Accessories`,
    description: accessory.shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${accessory.name} | HUME Accessories`,
      description: accessory.shortDescription,
      url: canonicalUrl,
      images: accessory.images?.[0] ? [accessory.images[0]] : [],
    },
  };
}

export default async function AccessoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessory = await getAccessoryById(id);

  if (!accessory) {
    notFound();
  }

  const baseUrl = await getRequestSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: accessory.name,
    description: accessory.shortDescription,
    image: accessory.images,
    category: "Accessories",
    offers: {
      "@type": "Offer",
      price: accessory.price.toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/accessory/${accessory.id}`,
    },
    brand: { "@type": "Brand", name: "HUME Fragrance" },
  };

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <AccessoryDetailClient accessory={accessory} />
      <Footer />
    </main>
  );
}
