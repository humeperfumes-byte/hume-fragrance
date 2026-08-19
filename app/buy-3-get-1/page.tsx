import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BuyThreeGetOneBuilder from "@/components/BuyThreeGetOneBuilder";
import { JsonLd } from "@/components/JsonLd";
import { getAllPublicProducts } from "@/lib/db/products";
import { getBreadcrumbSchema } from "@/lib/seo";
import { getRequestSiteUrl } from "@/lib/request-site";
import { isDiscoverySetProductId } from "@/lib/discovery-set";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy 3 Get 1 Free Perfumes | HUME Fragrance",
  description:
    "Choose any four eligible HUME 50ml perfumes and get the lowest-priced fragrance free. Build your Buy 3 Get 1 perfume bundle online.",
};

export default async function BuyThreeGetOnePage() {
  const [baseUrl, products] = await Promise.all([
    getRequestSiteUrl(),
    getAllPublicProducts(),
  ]);
  const eligibleProducts = products.filter(
    (product) =>
      !isDiscoverySetProductId(product.id) &&
      !product.badges?.soldOut &&
      !product.badges?.comingSoon &&
      product.size.toLowerCase().includes("50ml"),
  );

  const offerSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "HUME Buy 3 Get 1 Free Perfume Offer",
    url: `${baseUrl}/buy-3-get-1`,
    description: "Choose four eligible HUME perfumes and get the lowest-priced perfume free.",
    itemListElement: eligibleProducts.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
    })),
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed]">
      <JsonLd
        data={[
          offerSchema,
          getBreadcrumbSchema([
            { name: "Home", url: baseUrl },
            { name: "Buy 3 Get 1 Free", url: `${baseUrl}/buy-3-get-1` },
          ]),
        ]}
      />
      <Header />
      <BuyThreeGetOneBuilder products={eligibleProducts} />
      <Footer />
    </main>
  );
}
