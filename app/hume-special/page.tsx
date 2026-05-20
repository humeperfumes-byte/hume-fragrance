import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import SeoHubTeaser from "@/components/SeoHubTeaser";
import { JsonLd } from "@/components/JsonLd";
import { getAllPublicProducts } from "@/lib/db/products";
import { getBreadcrumbSchema, getItemListSchema } from "@/lib/seo";
import { getRequestSiteUrl } from "@/lib/request-site";

export const metadata: Metadata = {
  title: "HUME Special",
  description:
    "Discover all HUME Special perfumes - curated premium inspired fragrances with standout profiles.",
};

export const revalidate = 120;

export default async function HumeSpecialPage() {
  const baseUrl = await getRequestSiteUrl();
  const products = await getAllPublicProducts();
  const specialProducts = products.filter((p) => p.badges?.humeSpecial);
  const jsonLd = [
    getItemListSchema(
      "HUME Special Fragrances",
      "/hume-special",
      specialProducts,
      baseUrl,
    ),
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "HUME Special", url: `${baseUrl}/hume-special` },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-caption text-muted-foreground mb-4">
              Curated Edit
            </p>
            <h1 className="text-headline mb-4">
              HUME <span className="italic">Special</span>
            </h1>
            <div className="divider-elegant mx-auto mb-6" />
            <p className="text-body text-muted-foreground max-w-xl mx-auto">
              Handpicked signature fragrances from our collection.
            </p>
          </div>

          {specialProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
              {specialProducts.map((perfume, index) => (
                <PerfumeCard
                  key={perfume.id}
                  id={perfume.id}
                  name={perfume.name}
                  inspiration={perfume.inspiration}
                  inspirationBrand={perfume.inspirationBrand}
                  category={perfume.category}
                  categoryTags={perfume.categoryTags}
                  categoryIds={perfume.categoryIds}
                  image={perfume.images[0]}
                  price={perfume.price}
                  index={index}
                  bestSeller={perfume.badges?.bestSeller}
                  humeSpecial={perfume.badges?.humeSpecial}
                  limitedStock={perfume.badges?.limitedStock}
                  soldOut={perfume.badges?.soldOut}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No HUME Special fragrances available right now.
            </p>
          )}
        </div>
      </section>

      <SeoHubTeaser />
      <Footer />
    </main>
  );
}
