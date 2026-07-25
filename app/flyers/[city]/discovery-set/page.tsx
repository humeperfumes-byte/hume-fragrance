import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import DiscoverySetBuilder from "@/components/DiscoverySetBuilder";
import { getCityFlyerConfig } from "@/lib/flyer-cities";
import { getRequestSiteUrl } from "@/lib/request-site";
import FlyerHeroBanner from "@/components/FlyerHeroBanner";
import { getBreadcrumbSchema } from "@/lib/seo";

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
    title: `${config.greeting} Discovery Set | HUME Fragrance ${config.cityName}`,
    description: `Special Blinkit & Zepto flyer offer for ${config.cityName}. Build your custom perfume trial kit with 15 samples. ${config.discountText}.`,
    alternates: {
      canonical: `${baseUrl}/flyers/${config.slug}/discovery-set`,
    },
  };
}

export default async function FlyerDiscoverySetPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const config = getCityFlyerConfig(city);
  const baseUrl = await getRequestSiteUrl();

  const jsonLd = [
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Discovery Set", url: `${baseUrl}/discovery-set` },
      { name: `${config.cityName} Discovery Offer`, url: `${baseUrl}/flyers/${config.slug}/discovery-set` },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd data={jsonLd} />
      <Header />

      <FlyerHeroBanner config={config} mode="discovery-set" />

      <main className="py-6">
        <DiscoverySetBuilder />
      </main>

      <Footer />
    </div>
  );
}
