import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { getAllProducts, getProductById } from "@/lib/db/products";
import {
  getAllProgrammaticInspirations,
  getAlternativeToBySlug,
} from "@/lib/programmatic-seo";
import { getProductPath } from "@/lib/product-route";

const baseUrl = "https://humefragrance.com";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export async function generateStaticParams() {
  return getAllProgrammaticInspirations().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getAlternativeToBySlug(slug);
  if (!item) return { title: "Not Found" };

  const product = await getProductById(item.humeProduct.slug);
  if (!product) return { title: "Not Found" };

  return {
    title: `Best Alternative to ${item.originalName} in India | HUME`,
    description: `Looking for a ${item.originalName} alternative? Compare notes, pricing and performance with HUME ${product.name}.`,
    alternates: {
      canonical: `${baseUrl}/alternatives-to/${item.slug}`,
    },
    openGraph: {
      title: `${item.originalName} Alternative - HUME ${product.name}`,
      description: `Save ${formatPrice(item.savings)} with a similar ${item.scent_profile.family} profile.`,
      url: `${baseUrl}/alternatives-to/${item.slug}`,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function AlternativesToPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getAlternativeToBySlug(slug);
  if (!item) notFound();

  const [primary, products] = await Promise.all([
    getProductById(item.humeProduct.slug),
    getAllProducts(),
  ]);
  if (!primary) notFound();

  const related = products
    .filter((p) => p.id !== primary.id)
    .filter((p) => p.categoryId === primary.categoryId)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Best Alternative to ${item.originalName}`,
    url: `${baseUrl}/alternatives-to/${item.slug}`,
    description: item.why_inspired,
  };

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury space-y-10">
          <div className="max-w-3xl">
            <p className="text-caption text-muted-foreground mb-3">Alternatives Guide</p>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
              Best Alternative to {item.originalName} in India
            </h1>
            <p className="text-body text-muted-foreground">{item.why_inspired}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h2 className="font-serif text-2xl mb-2">{item.originalName}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Signature family: {item.scent_profile.family}
              </p>
              <p className="text-xl font-semibold">{formatPrice(item.original_price)}</p>
            </div>
            <div className="border border-border p-6 bg-secondary/10">
              <h2 className="font-serif text-2xl mb-2">HUME {primary.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Longevity: {item.characteristics.longevity} | Projection: {item.characteristics.projection}
              </p>
              <p className="text-xl font-semibold mb-4">{formatPrice(primary.price)}</p>
              <Button asChild>
                <Link href={getProductPath(primary)}>Shop This Alternative</Link>
              </Button>
            </div>
          </div>

          <div className="border border-border p-6">
            <h3 className="font-serif text-2xl mb-3">Why Buyers Switch</h3>
            <p className="text-sm text-muted-foreground mb-3">{item.what_makes_original_iconic}</p>
            <p className="text-sm text-muted-foreground">{item.how_hume_captures_essence}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-serif text-2xl mb-3">Scent Notes</h3>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Top:</span> {item.scent_profile.top_notes.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Heart:</span> {item.scent_profile.heart_notes.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Base:</span> {item.scent_profile.base_notes.join(", ")}
              </p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-serif text-2xl mb-3">Best Use Cases</h3>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Seasons:</span> {item.characteristics.seasons.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Occasions:</span> {item.characteristics.occasions.join(", ")}
              </p>
            </div>
          </div>

          {related.length > 0 && (
            <div>
              <h3 className="font-serif text-3xl mb-6">Related Alternatives</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((itemProduct, idx) => (
                  <PerfumeCard
                    key={itemProduct.id}
                    id={itemProduct.id}
                    name={itemProduct.name}
                    inspiration={itemProduct.inspiration}
                    inspirationBrand={itemProduct.inspirationBrand}
                    category={itemProduct.category}
                    categoryTags={itemProduct.categoryTags}
                    categoryIds={itemProduct.categoryIds}
                    image={itemProduct.images[0]}
                    price={itemProduct.price}
                    index={idx}
                    bestSeller={itemProduct.badges?.bestSeller}
                    limitedStock={itemProduct.badges?.limitedStock}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for more options? Explore all inspired fragrances in our shop.
            </p>
            <Button asChild variant="outline">
              <Link href="/shop">Browse All Fragrances</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
