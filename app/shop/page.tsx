import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCollectionPageSchema, getBreadcrumbSchema } from "@/lib/seo";
import { getAllPublicProducts } from "@/lib/db/products";
import ShopContent from "./ShopContent";
import SeoHubTeaser from "@/components/SeoHubTeaser";
import { getRequestSiteUrl } from "@/lib/request-site";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const baseUrl = await getRequestSiteUrl();
  const perfumes = await getAllPublicProducts();

  const shopJsonLd = [
    getCollectionPageSchema(perfumes, baseUrl),
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Shop", url: `${baseUrl}/shop` },
    ]),
  ];

  return (
    <div className="shop-mobile-tight min-h-screen bg-background">
      <JsonLd data={shopJsonLd} />
      <Header />
      <Suspense
        fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <ShopContent perfumes={perfumes} />
      </Suspense>
      <SeoHubTeaser />
      <Footer />
    </div>
  );
}
