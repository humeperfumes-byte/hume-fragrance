import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCollectionPageSchema, getBreadcrumbSchema } from "@/lib/seo";
import { getAllPublicProducts } from "@/lib/db/products";
import ShopContent from "@/app/shop/ShopContent";
import { getCityFlyerConfig } from "@/lib/flyer-cities";
import { getRequestSiteUrl } from "@/lib/request-site";
import FlyerHeroBanner from "@/components/FlyerHeroBanner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const config = getCityFlyerConfig(city);
  const baseUrl = await getRequestSiteUrl();

  return {
    title: `${config.greeting} | HUME Fragrance ${config.cityName} Partner Offer`,
    description: `Special Blinkit & Zepto flyer welcome offer for ${config.cityName}. ${config.discountText}. Shop luxury EDP perfumes handcrafted in Kannauj.`,
    alternates: {
      canonical: `${baseUrl}/flyers/${config.slug}/perfumes`,
    },
  };
}

export default async function FlyerPerfumesPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const config = getCityFlyerConfig(city);
  const baseUrl = await getRequestSiteUrl();
  const perfumes = await getAllPublicProducts();

  const jsonLd = [
    getCollectionPageSchema(perfumes, baseUrl),
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Shop", url: `${baseUrl}/shop` },
      { name: `${config.cityName} Partner Offer`, url: `${baseUrl}/flyers/${config.slug}/perfumes` },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <Header />
      
      <FlyerHeroBanner config={config} mode="perfumes" />

      <Suspense
        fallback={
          <div className="min-h-[50vh] bg-background flex items-center justify-center">
            <p className="text-muted-foreground">Loading perfumes catalog...</p>
          </div>
        }
      >
        <ShopContent perfumes={perfumes} disableTopPadding={true} />
      </Suspense>

      <Footer />
    </div>
  );
}
