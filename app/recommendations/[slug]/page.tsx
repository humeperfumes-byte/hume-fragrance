import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import {
  getAiRecommendationPage,
  getRecommendedProducts,
} from "@/lib/ai-recommendation-pages";
import { getAllPublicProducts } from "@/lib/db/products";
import { getBreadcrumbSchema } from "@/lib/seo";
import { getProductPath } from "@/lib/product-route";
import { getRequestSiteUrl } from "@/lib/request-site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getAiRecommendationPage(slug);
  const baseUrl = await getRequestSiteUrl();
  if (!page) return { title: "Recommendation Not Found" };

  return {
    title: `${page.title} | HUME Fragrance`,
    description: page.description,
    alternates: {
      canonical: `${baseUrl}/recommendations/${page.slug}`,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${baseUrl}/recommendations/${page.slug}`,
      type: "article",
    },
  };
}

export default async function AiRecommendationPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getAiRecommendationPage(slug);
  if (!page) notFound();

  const baseUrl = await getRequestSiteUrl();
  const products = await getAllPublicProducts();
  const recommendations = getRecommendedProducts(products, page, 6);
  const canonicalUrl = `${baseUrl}/recommendations/${page.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: page.title,
      description: page.description,
      url: canonicalUrl,
      dateModified: new Date().toISOString(),
      author: {
        "@type": "Organization",
        name: "HUME Fragrance",
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "HUME Fragrance",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/images/logo.png`,
        },
      },
      mainEntity: {
        "@type": "Question",
        name: page.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: page.answer,
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: page.title,
      numberOfItems: recommendations.length,
      itemListElement: recommendations.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}${getProductPath(product)}`,
        name: product.name,
      })),
    },
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Fragrance Guides", url: `${baseUrl}/fragrance-guides` },
      { name: page.title, url: canonicalUrl },
    ]),
  ];

  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={jsonLd} />
      <Header />
      <section className="pt-28 pb-14">
        <div className="container-luxury">
          <p className="text-caption text-muted-foreground mb-3">
            Quick Perfume Recommendation
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-5">
            {page.title}
          </h1>
          <div className="max-w-4xl border-l-2 border-foreground pl-5">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground mb-3">
              Quick Answer
            </p>
            <p className="text-lg leading-relaxed text-foreground">
              {page.answer}
            </p>
          </div>
          <p className="mt-6 max-w-3xl text-body text-muted-foreground">
            These picks are selected from the current HUME catalog using scent
            family, notes, occasion, performance profile, and buyer intent:
            {" "}
            <span className="text-foreground">{page.buyerIntent}</span>.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-caption text-muted-foreground mb-2">
                Recommended Products
              </p>
              <h2 className="font-serif text-3xl">Best Matches</h2>
            </div>
            <Link
              href="/shop"
              className="text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Shop all perfumes
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-7 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {recommendations.map((product, index) => (
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
                humeSpecial={product.badges?.humeSpecial}
                limitedStock={product.badges?.limitedStock}
                soldOut={product.badges?.soldOut}
                disableEntranceAnimation
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-secondary/20 py-14">
        <div className="container-luxury">
          <h2 className="font-serif text-3xl mb-4">How To Choose</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <p className="text-caption text-muted-foreground mb-2">Notes</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Match the note family to the use case. Fresh and citrus notes
                suit daytime, while amber, vanilla, leather, oud, and tobacco
                feel stronger for evenings.
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground mb-2">
                Performance
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                For Indian weather, balance projection with comfort. Office
                scents should stay clean, while night scents can be richer and
                more noticeable.
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground mb-2">Budget</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                HUME focuses on accessible 50ml EDP bottles so buyers can get a
                premium scent direction without paying designer retail pricing.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
