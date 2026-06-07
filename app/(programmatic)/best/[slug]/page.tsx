import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/db/products";
import {
  buildBestPageFaq,
  getProgrammaticAlternativeBySlug,
} from "@/lib/programmatic-seo";
import { getRequestSiteUrl } from "@/lib/request-site";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getProgrammaticAlternativeBySlug(slug);
  if (!item) return { title: "Not Found" };

  const baseUrl = await getRequestSiteUrl();

  return {
    title: `${item.title} | HUME Fragrance`,
    description: `${item.intro} Find top picks, note profiles, and direct links to product pages.`,
    alternates: {
      canonical: `${baseUrl}/best/${item.slug}`,
    },
    openGraph: {
      title: item.title,
      description: item.why_this_matters,
      url: `${baseUrl}/best/${item.slug}`,
    },
  };
}

export default async function BestProgrammaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getProgrammaticAlternativeBySlug(slug);
  if (!item) notFound();
  const baseUrl = await getRequestSiteUrl();

  const products = await getAllProducts();
  const selected = item.humeProducts
    .map((productId) => products.find((product) => product.id === productId))
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product),
    );

  const faq = buildBestPageFaq(item);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: item.title,
      url: `${baseUrl}/best/${item.slug}`,
      description: item.intro,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })),
    },
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury space-y-10">
          <div className="max-w-4xl">
            <p className="text-caption text-muted-foreground mb-3">
              Buying Guide
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
              {item.title}
            </h1>
            <p className="text-body text-muted-foreground mb-3">{item.intro}</p>
            <p className="text-sm text-muted-foreground">
              {item.why_this_matters}
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Quick Answer
            </p>
            <p className="text-sm text-muted-foreground">
              For {item.targetKeyword}, choose EDP-style profiles with stable
              base notes and 8+ hour wear in Indian weather. This page
              prioritizes practical picks with strong value and balanced
              projection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-1">
                Target Keyword
              </p>
              <p className="text-sm">{item.targetKeyword}</p>
            </div>
            <div className="border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-1">
                Search Intent
              </p>
              <p className="text-sm">{item.searchIntent}</p>
            </div>
            <div className="border border-border p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-1">
                Competition
              </p>
              <p className="text-sm">
                {item.difficulty} ({item.monthlySearches} monthly searches)
              </p>
            </div>
          </div>

          {selected.length > 0 ? (
            <div>
              <h2 className="font-serif text-3xl mb-6">Top Picks</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {selected.map((product, index) => (
                  <PerfumeCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    inspiration={product.inspiration}
                    inspirationBrand={product.inspirationBrand}
                    category={product.category}
                    categoryTags={product.categoryTags}
                    categoryIds={product.categoryIds}
                    image={product.images[0]}
                    price={product.price}
                    index={index}
                    bestSeller={product.badges?.bestSeller}
                    limitedStock={product.badges?.limitedStock}
                    soldOut={product.badges?.soldOut}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="border border-border p-6">
              <p className="text-muted-foreground">
                Recommended products are being updated for this guide.
              </p>
            </div>
          )}

          <div className="border border-border p-6">
            <h2 className="font-serif text-2xl mb-4">FAQ</h2>
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

          <div className="border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Explore complete product details, reviews, notes, and pricing in
              our main catalog.
            </p>
            <Button asChild>
              <Link href="/shop">Browse All Fragrances</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
