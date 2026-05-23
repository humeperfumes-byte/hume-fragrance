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
  buildInspiredFaq,
  getAllProgrammaticInspirations,
  getProgrammaticInspirationBySlug,
} from "@/lib/programmatic-seo";
import { getProductPath } from "@/lib/product-route";
import { getRequestSiteUrl } from "@/lib/request-site";

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
  const item = getProgrammaticInspirationBySlug(slug);
  if (!item) return { title: "Not Found" };

  const product = await getProductById(item.humeProduct.slug);
  if (!product) return { title: "Not Found" };

  const baseUrl = await getRequestSiteUrl();
  const isDemandValidation = item.availability === "demand_validation";

  return {
    title: isDemandValidation
      ? `${item.originalBrand} ${item.originalName} Inspired Perfume Interest | HUME`
      : `${product.name}: Inspired by ${item.originalBrand} ${item.originalName} | HUME`,
    description: isDemandValidation
      ? `Explore demand for a ${item.scent_profile.family} style inspired by ${item.originalName}, with the closest current HUME fragrance direction linked for shoppers.`
      : `Experience ${item.scent_profile.family} style inspired by ${item.originalName}. ${item.characteristics.longevity} longevity and premium EDP quality at ${formatPrice(product.price)}.`,
    alternates: {
      canonical: `${baseUrl}/inspired-by/${item.slug}`,
    },
    openGraph: {
      title: isDemandValidation
        ? `${item.originalBrand} ${item.originalName} Inspired Perfume Interest`
        : `HUME ${product.name} - Inspired by ${item.originalName}`,
      description: isDemandValidation
        ? `Demand watch page for a ${item.scent_profile.family} style inspired by ${item.originalName}.`
        : `Save ${formatPrice(item.savings)} on ${item.originalName} style fragrance.`,
      url: `${baseUrl}/inspired-by/${item.slug}`,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function InspiredByPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getProgrammaticInspirationBySlug(slug);
  if (!item) notFound();
  const baseUrl = await getRequestSiteUrl();

  const [product, allProducts] = await Promise.all([
    getProductById(item.humeProduct.slug),
    getAllProducts(),
  ]);
  if (!product) notFound();
  const isDemandValidation = item.availability === "demand_validation";

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .filter(
      (p) =>
        p.categoryId === product.categoryId ||
        p.inspirationBrand.toLowerCase() === item.originalBrand.toLowerCase(),
    )
    .slice(0, 4);

  const faq = buildInspiredFaq(item);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${product.name} Inspired by ${item.originalName}`,
      url: `${baseUrl}/inspired-by/${item.slug}`,
      description: item.why_inspired,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    },
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury space-y-12">
          <div className="max-w-3xl">
            <p className="text-caption text-muted-foreground mb-3">
              {isDemandValidation ? "Inspired Demand Watch" : "Inspired Collection"}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
              {isDemandValidation
                ? `${item.originalBrand} ${item.originalName} Inspired Perfume`
                : `${product.name}: Inspired by ${item.originalName}`}
            </h1>
            <p className="text-body text-muted-foreground">
              {isDemandValidation
                ? `Explore the ${item.scent_profile.family.toLowerCase()} profile and the closest current HUME style while we track demand for this scent direction.`
                : `Experience ${item.scent_profile.family} luxury at ${formatPrice(product.price)} instead of ${formatPrice(item.original_price)}.`}
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Quick Answer
            </p>
            <p className="text-sm text-muted-foreground">
              {isDemandValidation ? (
                <>
                  HUME is tracking demand for{" "}
                  <span className="font-medium text-foreground">
                    {item.originalBrand} {item.originalName}
                  </span>
                  . The closest current HUME style is{" "}
                  <span className="font-medium text-foreground">
                    {product.name}
                  </span>
                  , selected for a nearby{" "}
                  {item.scent_profile.family.toLowerCase()} direction with{" "}
                  {item.characteristics.longevity.toLowerCase()} expected wear.
                </>
              ) : (
                <>
                  The closest daily-wear option here is{" "}
                  <span className="font-medium text-foreground">
                    {product.name}
                  </span>
                  , inspired by {item.originalBrand} {item.originalName}, with{" "}
                  {item.characteristics.longevity.toLowerCase()} and a{" "}
                  {item.scent_profile.family.toLowerCase()} profile at{" "}
                  {formatPrice(product.price)}.
                </>
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6 bg-secondary/10">
              <p className="text-caption text-muted-foreground mb-2">
                Original
              </p>
              <h2 className="font-serif text-2xl mb-2">
                {item.originalBrand} {item.originalName}
              </h2>
              <p className="text-2xl font-semibold mb-2">
                {formatPrice(item.original_price)}
              </p>
              <p className="text-sm text-muted-foreground">
                Premium designer pricing
              </p>
            </div>
            <div className="border border-border p-6 bg-secondary/10">
              <p className="text-caption text-muted-foreground mb-2">
                {isDemandValidation ? "Closest HUME Style" : "HUME Alternative"}
              </p>
              <h2 className="font-serif text-2xl mb-2">{product.name}</h2>
              <p className="text-2xl font-semibold mb-2">
                {formatPrice(product.price)}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {isDemandValidation
                  ? "This exact inspired profile is being evaluated. Start with the closest available HUME direction."
                  : `Save ${formatPrice(item.savings)} with the same scent direction.`}
              </p>
              <Button asChild>
                <Link href={getProductPath(product)}>
                  {isDemandValidation ? "Explore Closest HUME Style" : "View Full Product Details"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-border p-5">
              <h3 className="font-serif text-xl mb-3">Top Notes</h3>
              <p className="text-sm text-muted-foreground">
                {item.scent_profile.top_notes.join(", ")}
              </p>
            </div>
            <div className="border border-border p-5">
              <h3 className="font-serif text-xl mb-3">Heart Notes</h3>
              <p className="text-sm text-muted-foreground">
                {item.scent_profile.heart_notes.join(", ")}
              </p>
            </div>
            <div className="border border-border p-5">
              <h3 className="font-serif text-xl mb-3">Base Notes</h3>
              <p className="text-sm text-muted-foreground">
                {item.scent_profile.base_notes.join(", ")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-serif text-2xl mb-3">What Makes It Iconic</h3>
              <p className="text-sm text-muted-foreground">
                {item.what_makes_original_iconic}
              </p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-serif text-2xl mb-3">
                {isDemandValidation ? "Demand Signal & Closest Match" : "How HUME Captures It"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.how_hume_captures_essence}
              </p>
            </div>
          </div>

          <div className="border border-border p-6">
            <h3 className="font-serif text-2xl mb-3">Formulated For India</h3>
            <p className="text-sm text-muted-foreground">
              {item.formulated_for_india}
            </p>
          </div>

          <div className="border border-border p-6">
            <h3 className="font-serif text-2xl mb-5">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {faq.map((entry) => (
                <div key={entry.question}>
                  <p className="font-medium mb-1">{entry.question}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div>
              <h3 className="font-serif text-3xl mb-6">You Might Also Like</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((related, idx) => (
                  <PerfumeCard
                    key={related.id}
                    id={related.id}
                    name={related.name}
                    inspiration={related.inspiration}
                    inspirationBrand={related.inspirationBrand}
                    category={related.category}
                    categoryTags={related.categoryTags}
                    categoryIds={related.categoryIds}
                    image={related.images[0]}
                    price={related.price}
                    index={idx}
                    bestSeller={related.badges?.bestSeller}
                    limitedStock={related.badges?.limitedStock}
                    soldOut={related.badges?.soldOut}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
