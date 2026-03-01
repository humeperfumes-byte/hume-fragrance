import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getCollectionPageSchema, getBreadcrumbSchema } from "@/lib/seo";
import { getAllProducts } from "@/lib/db/products";
import ShopContent from "./ShopContent";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const perfumes = await getAllProducts();

  const shopJsonLd = [
    getCollectionPageSchema(perfumes),
    getBreadcrumbSchema([
      { name: "Home", url: "https://humefragrance.com" },
      { name: "Shop", url: "https://humefragrance.com/shop" },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={shopJsonLd} />
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }>
        <ShopContent perfumes={perfumes} />
      </Suspense>
      <Footer />
    </div>
  );
}
