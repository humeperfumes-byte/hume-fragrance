import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo";
import { getAllProducts } from "@/lib/db/products";
import { getIntentPageBySlug } from "@/lib/intent-pages";
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
  const page = getIntentPageBySlug(slug);
  if (!page) return { title: "Not Found" };
  const baseUrl = await getRequestSiteUrl();

  return {
    title: `${page.title} | HUME Perfumes`,
    description: page.description,
    alternates: {
      canonical: `${baseUrl}/alternatives/${page.slug}`,
    },
  };
}

function scoreProduct(text: string, terms: string[]): number {
  const haystack = text.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term.toLowerCase())) score += 1;
  }
  return score;
}

export default async function AlternativeIntentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getIntentPageBySlug(slug);
  if (!page) notFound();
  const baseUrl = await getRequestSiteUrl();

  const products = await getAllProducts();
  const ranked = products
    .map((product) => {
      const searchable = [
        product.name,
        product.inspiration,
        product.inspirationBrand,
        product.description,
        product.category,
      ].join(" ");
      return { product, score: scoreProduct(searchable, page.targetTerms) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.product);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: page.title,
      description: page.description,
      url: `${baseUrl}/alternatives/${page.slug}`,
    },
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Alternatives", url: `${baseUrl}/alternatives` },
      { name: page.title, url: `${baseUrl}/alternatives/${page.slug}` },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury">
          <div className="max-w-3xl mb-12">
            <p className="text-caption text-muted-foreground mb-3">
              Programmatic Guide
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-5">
              {page.heading}
            </h1>
            <p className="text-body text-muted-foreground">{page.intro}</p>
          </div>

          {ranked.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {ranked.map((perfume, idx) => (
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
                  index={idx}
                  bestSeller={perfume.badges?.bestSeller}
                  limitedStock={perfume.badges?.limitedStock}
                  soldOut={perfume.badges?.soldOut}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No exact matches found yet for this intent page.
              </p>
              <Link
                href="/shop"
                className="text-caption link-underline text-foreground"
              >
                Browse All Perfumes
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
