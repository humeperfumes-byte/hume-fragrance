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
  title: "Best Seller",
  description:
    "Explore HUME best seller perfumes - top rated and most loved inspired fragrances.",
};

export const dynamic = "force-dynamic";

export default async function BestsellerPage() {
  const baseUrl = await getRequestSiteUrl();
  const products = await getAllPublicProducts();
  const bestsellerProducts = products.filter((p) => p.badges?.bestSeller);
  const bestsellerProductIds = new Set(bestsellerProducts.map((product) => product.id));
  const remainingProducts = products.filter((product) => !bestsellerProductIds.has(product.id));
  const jsonLd = [
    getItemListSchema(
      "HUME Best Seller Fragrances",
      "/bestseller",
      bestsellerProducts,
      baseUrl,
    ),
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Best Seller", url: `${baseUrl}/bestseller` },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-caption text-muted-foreground mb-4">Top Picks</p>
            <h1 className="text-headline mb-4">
              Best <span className="italic">Seller</span>
            </h1>
            <div className="divider-elegant mx-auto mb-6" />
            <p className="text-body text-muted-foreground max-w-xl mx-auto">
              Most purchased and most loved fragrances from the HUME collection.
            </p>
          </div>

          {bestsellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
              {bestsellerProducts.map((perfume, index) => (
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
              No best seller fragrances available right now.
            </p>
          )}
        </div>
      </section>

      {remainingProducts.length > 0 ? (
        <section className="pb-20 md:pb-24">
          <div className="container-luxury">
            <div className="mb-10 md:mb-12">
              <p className="text-caption text-muted-foreground mb-3">
                Continue Exploring
              </p>
              <h2 className="font-serif text-3xl font-light md:text-4xl">
                All Fragrances
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start">
              {remainingProducts.map((perfume, index) => (
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
                  index={bestsellerProducts.length + index}
                  bestSeller={perfume.badges?.bestSeller}
                  humeSpecial={perfume.badges?.humeSpecial}
                  limitedStock={perfume.badges?.limitedStock}
                  soldOut={perfume.badges?.soldOut}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <SeoHubTeaser />
      <Footer />
    </main>
  );
}
