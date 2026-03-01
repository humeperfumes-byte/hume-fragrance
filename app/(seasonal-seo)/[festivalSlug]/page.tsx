import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import SeoEmailCapture from "@/components/SeoEmailCapture";
import { getAllProducts } from "@/lib/db/products";
import {
  FESTIVAL_SEO_PAGES,
  buildFestivalLongContent,
  getFestivalSeoEntry,
  getFestivalSeoSlugs,
} from "@/lib/festival-seo";

type Props = {
  params: Promise<{ festivalSlug: string }>;
};

const ALLOWED_SLUGS = new Set(getFestivalSeoSlugs());

const sortRecommendedProducts = (
  products: Awaited<ReturnType<typeof getAllProducts>>,
  keywords: string[]
) => {
  const lowerKeywords = keywords.map((keyword) => keyword.toLowerCase());

  const score = (text: string) =>
    lowerKeywords.reduce((sum, keyword) => (text.includes(keyword) ? sum + 1 : sum), 0);

  return [...products]
    .map((product) => {
      const combined = [
        product.name,
        product.inspiration,
        product.inspirationBrand ?? "",
        product.category,
        product.notes.top.join(" "),
        product.notes.heart.join(" "),
        product.notes.base.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const weightedScore =
        score(combined) +
        (product.badges?.humeSpecial ? 1 : 0) +
        (product.badges?.bestSeller ? 1 : 0);

      return { product, weightedScore };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore)
    .map((item) => item.product);
};

export async function generateStaticParams() {
  return getFestivalSeoSlugs().map((festivalSlug) => ({ festivalSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { festivalSlug } = await params;
  const page = getFestivalSeoEntry(festivalSlug);
  if (!page) return {};

  const canonical = `https://humefragrance.com/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      type: "article",
    },
  };
}

export default async function FestivalSeoPage({ params }: Props) {
  const { festivalSlug } = await params;

  if (!ALLOWED_SLUGS.has(festivalSlug)) notFound();

  const page = getFestivalSeoEntry(festivalSlug);
  if (!page) notFound();

  const products = await getAllProducts();
  const recommended = sortRecommendedProducts(products, page.focusKeywords).slice(0, 4);
  const longSections = buildFestivalLongContent(page);
  const relatedLinks = FESTIVAL_SEO_PAGES.filter((entry) => entry.slug !== page.slug).slice(0, 4);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="bg-background text-foreground min-h-screen">
      <JsonLd data={faqJsonLd} />
      <Header />
      <section className="pt-28 pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Festival Fragrance Guide</p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl leading-tight max-w-4xl">{page.title}</h1>
          <p className="mt-5 max-w-3xl text-base md:text-lg text-muted-foreground">{page.intro}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Primary Intent</p>
              <p className="mt-2 font-medium">Festival-ready perfume recommendations</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Performance Goal</p>
              <p className="mt-2 font-medium">Comfortable 8–10 hour wear in Indian weather</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Style Direction</p>
              <p className="mt-2 font-medium">{page.styleKeywords.join(", ")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom max-w-5xl px-4 sm:px-6 lg:px-10">
          <div className="space-y-10">
            {longSections.map((section) => (
              <article key={section.heading}>
                <h2 className="font-serif text-3xl">{section.heading}</h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">{section.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Recommendations</p>
              <h2 className="mt-2 font-serif text-4xl">Perfume picks for {page.festivalName}</h2>
            </div>
            <Link href="/shop" className="text-sm uppercase tracking-[0.18em] border-b border-foreground/20 pb-1 hover:border-foreground">
              Shop All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((product, index) => (
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
              />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-10">
          <h2 className="font-serif text-4xl">Related fragrance guides</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {relatedLinks.map((entry) => (
              <Link
                key={entry.slug}
                href={`/${entry.slug}`}
                className="rounded-xl border border-border bg-card p-4 transition hover:bg-secondary/20"
              >
                <p className="text-sm font-medium">{entry.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">Read this guide</p>
              </Link>
            ))}
            <Link href="/hume-special" className="rounded-xl border border-border bg-card p-4 transition hover:bg-secondary/20">
              <p className="text-sm font-medium">Explore HUME Special collection</p>
              <p className="mt-1 text-xs text-muted-foreground">Discover premium featured fragrances</p>
            </Link>
            <Link href="/bestseller" className="rounded-xl border border-border bg-card p-4 transition hover:bg-secondary/20">
              <p className="text-sm font-medium">Browse best sellers</p>
              <p className="mt-1 text-xs text-muted-foreground">Most loved picks from our customers</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom max-w-4xl px-4 sm:px-6 lg:px-10">
          <h2 className="font-serif text-4xl">FAQ</h2>
          <div className="mt-6 space-y-4">
            {page.faq.map((item) => (
              <details key={item.question} className="rounded-xl border border-border bg-card p-4">
                <summary className="cursor-pointer text-base font-medium">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-custom max-w-4xl space-y-6 px-4 sm:px-6 lg:px-10">
          <SeoEmailCapture festivalName={page.festivalName} />
          <div className="rounded-2xl border border-border bg-foreground text-background p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-background/70">Product CTA</p>
            <h2 className="mt-2 font-serif text-3xl">Find your {page.festivalName} signature scent</h2>
            <p className="mt-2 text-sm text-background/80">
              Shop HUME perfumes designed for Indian conditions with premium profiles and reliable performance.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-11 items-center rounded-md bg-background px-5 text-sm font-medium text-foreground"
              >
                Shop Fragrances
              </Link>
              <a
                href="https://wa.me/919559024822?text=Hi%2C%20I%20need%20a%20festival%20perfume%20recommendation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center rounded-md border border-background/30 px-5 text-sm font-medium text-background"
              >
                Get WhatsApp Help
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
