import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo";
import {
  getAllProgrammaticAlternatives,
  getAllProgrammaticInspirations,
  getHighIntentProgrammaticInspirations,
} from "@/lib/programmatic-seo";
import { FESTIVAL_SEO_PAGES } from "@/lib/festival-seo";
import { getRequestSiteUrl } from "@/lib/request-site";
import { AI_RECOMMENDATION_PAGES } from "@/lib/ai-recommendation-pages";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getRequestSiteUrl();

  return {
    title: "Fragrance Guides Hub | HUME",
    description:
      "Browse all HUME fragrance guides: occasion picks, inspired alternatives, budget lists, and note-based recommendations.",
    alternates: {
      canonical: `${baseUrl}/fragrance-guides`,
    },
  };
}

type LinkItem = { href: string; label: string };

function section(title: string, links: LinkItem[]) {
  return { title, links };
}

function prettyFromSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function renderLinks(items: LinkItem[]) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/25 transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default async function FragranceGuidesHubPage() {
  const baseUrl = await getRequestSiteUrl();
  const aiSearchGuides = [
    "best-perfumes-for-men-available-online-in-india",
    "difference-between-edp-and-edt",
    "top-rated-floral-perfumes-for-women-in-india",
    "best-long-lasting-perfumes-for-men",
    "where-can-i-buy-genuine-designer-perfumes-near-me",
    "fragrance-families-explained",
    "affordable-long-lasting-perfumes-under-1500-inr",
    "how-to-apply-perfume-for-maximum-longevity",
    "how-to-choose-a-signature-scent-from-popular-perfume-brands",
    "affordable-luxury-perfume-brands-for-women",
  ]
    .map((slug) => FESTIVAL_SEO_PAGES.find((item) => item.slug === slug))
    .filter((item): item is NonNullable<(typeof FESTIVAL_SEO_PAGES)[number]> =>
      Boolean(item),
    )
    .map((item) => ({ href: `/${item.slug}`, label: item.title }));
  const recommendationGuides = AI_RECOMMENDATION_PAGES.map((item) => ({
    href: `/recommendations/${item.slug}`,
    label: item.title,
  }));
  const highIntentInspiredGuides = getHighIntentProgrammaticInspirations().map(
    (item) => ({
      href: `/inspired-by/${item.slug}`,
      label: `${item.originalBrand} ${item.originalName} alternative`,
    }),
  );

  const occasionGuides = FESTIVAL_SEO_PAGES.filter(
    (item) =>
      item.slug.startsWith("perfume-for-") ||
      item.slug.startsWith("best-office-perfume"),
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const budgetGuides = FESTIVAL_SEO_PAGES.filter(
    (item) => item.slug.includes("under-") || item.slug.includes("budget"),
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const noteGuides = FESTIVAL_SEO_PAGES.filter((item) =>
    item.slug.endsWith("-perfume-men"),
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const performanceGuides = FESTIVAL_SEO_PAGES.filter(
    (item) =>
      item.slug.includes("long-lasting") ||
      item.slug.includes("lasting") ||
      item.slug.includes("projection") ||
      item.slug.includes("sillage") ||
      item.slug.includes("beast-mode"),
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const inspiredGuides = FESTIVAL_SEO_PAGES.filter((item) =>
    item.slug.endsWith("-inspired-perfume"),
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const compareAndEducation = FESTIVAL_SEO_PAGES.filter(
    (item) =>
      item.slug.includes("-vs-") ||
      item.slug.startsWith("how-to-") ||
      item.slug.startsWith("where-to-") ||
      item.slug.includes("explained") ||
      item.slug.includes("guide"),
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const programmaticInspired = getAllProgrammaticInspirations().map((item) => ({
    href: `/inspired-by/${item.slug}`,
    label: `Inspired by ${item.originalBrand} ${item.originalName}`,
  }));

  const programmaticAlternatives = getAllProgrammaticInspirations().map(
    (item) => ({
      href: `/alternatives-to/${item.slug}`,
      label: `Alternative to ${item.originalName}`,
    }),
  );

  const programmaticBest = getAllProgrammaticAlternatives().map((item) => ({
    href: `/best/${item.slug}`,
    label: item.title || prettyFromSlug(item.slug),
  }));

  const sections = [
    section("AI Recommendation Pages", recommendationGuides),
    section("High-Intent Inspired Alternatives", highIntentInspiredGuides),
    section("AI Search Guides", aiSearchGuides),
    section("Occasion Guides", occasionGuides),
    section("Budget Guides", budgetGuides),
    section("Note & Family Guides", noteGuides),
    section("Performance Guides", performanceGuides),
    section("Inspired Perfume Guides", inspiredGuides),
    section("Comparison & Education", compareAndEducation),
    section("Programmatic Inspired-by", programmaticInspired),
    section("Programmatic Alternatives-to", programmaticAlternatives),
    section("Programmatic Best Lists", programmaticBest),
  ].filter((item) => item.links.length > 0);

  const totalLinks = sections.reduce((sum, item) => sum + item.links.length, 0);
  const featuredShortcuts = [
    {
      href: "/best-perfumes-for-men-available-online-in-india",
      label: "Best Perfumes for Men Available Online in India",
    },
    {
      href: "/best-long-lasting-perfumes-for-men",
      label: "Best Long-Lasting Perfumes for Men",
    },
    {
      href: "/difference-between-edp-and-edt",
      label: "Difference Between EDP and EDT",
    },
    {
      href: "/fragrance-families-explained",
      label: "Fragrance Families Explained",
    },
    {
      href: "/how-to-apply-perfume-for-maximum-longevity",
      label: "How to Apply Perfume for Maximum Longevity",
    },
    {
      href: "/how-to-choose-a-signature-scent-from-popular-perfume-brands",
      label: "How to Choose a Signature Scent",
    },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Fragrance Guides Hub | HUME",
      url: `${baseUrl}/fragrance-guides`,
      description:
        "Complete directory of HUME fragrance guides: occasion picks, inspired alternatives, budget lists, comparison pages and scent family recommendations.",
      dateModified: new Date().toISOString(),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Fragrance Guides Index",
      numberOfItems: totalLinks,
      itemListElement: sections
        .flatMap((sectionItem) => sectionItem.links)
        .slice(0, 200)
        .map((link, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${baseUrl}${link.href}`,
          name: link.label,
        })),
    },
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Fragrance Guides", url: `${baseUrl}/fragrance-guides` },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <section className="pt-28 pb-16">
        <div className="container-luxury">
          <p className="text-caption text-muted-foreground mb-2">
            Perfume Guide Directory
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            Fragrance Guides
          </h1>
          <p className="text-body text-muted-foreground max-w-3xl">
            Find the perfect scent with our complete collection of perfume
            guides — from occasion picks and budget lists to designer
            alternatives and scent family deep-dives.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {totalLinks} guides available •{" "}
            <span className="font-medium text-foreground">
              Updated regularly
            </span>
          </p>
          <div className="mt-8 rounded-[28px] border border-border/60 bg-gradient-to-b from-white to-secondary/20 p-6 shadow-[0_18px_45px_rgba(15,15,20,0.04)]">
            <p className="text-caption text-muted-foreground mb-3">
              Quick Answer
            </p>
            <p className="text-body text-foreground max-w-4xl leading-relaxed">
              Looking for a perfume recommendation? Start with our best-sellers
              and occasion guides for quick picks, or explore inspired-by and
              alternatives pages if you already know a designer fragrance you
              love. Each guide links directly to the matching HUME product with
              full notes, reviews, and pricing.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featuredShortcuts.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container-luxury">
          <div className="rounded-[30px] border border-border/60 bg-gradient-to-br from-white via-secondary/10 to-secondary/25 p-6 md:p-8 shadow-[0_18px_45px_rgba(15,15,20,0.05)]">
            <div className="max-w-3xl">
              <p className="text-caption text-muted-foreground">
                High-Intent Inspired Searches
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                Niche & Designer Alternatives People Search For
              </h2>
              <p className="mt-3 text-body text-muted-foreground">
                These guides focus on expensive, high-demand fragrances with
                strong search intent around alternatives, inspired perfumes,
                performance, and Indian-weather value.
              </p>
            </div>
            <div className="mt-6">{renderLinks(highIntentInspiredGuides)}</div>
          </div>
        </div>
      </section>

      <section className="pb-14">
        <div className="container-luxury">
          <div className="rounded-[30px] border border-border/60 bg-gradient-to-br from-white via-secondary/10 to-secondary/25 p-6 md:p-8 shadow-[0_18px_45px_rgba(15,15,20,0.05)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-caption text-muted-foreground">
                  AI Search Layer
                </p>
                <h2 className="mt-3 font-serif text-3xl md:text-4xl">
                  Most-Asked Perfume Questions
                </h2>
                <p className="mt-3 text-body text-muted-foreground">
                  These pages are built around the exact questions users ask
                  ChatGPT, Gemini, and other AI assistants. They combine direct
                  answers, product suggestions, and structured explanations for
                  stronger AI citation pickup.
                </p>
              </div>
              <Link
                href="/best-perfumes-for-men-available-online-in-india"
                className="inline-flex h-11 items-center justify-center rounded-full border border-foreground/15 px-5 text-sm tracking-[0.12em] uppercase text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                Open Featured AI Guide
              </Link>
            </div>
            <div className="mt-6">{renderLinks(aiSearchGuides)}</div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury space-y-10">
          {sections.map((item) => (
            <div key={item.title} className="space-y-4">
              <h2 className="font-serif text-3xl">{item.title}</h2>
              {renderLinks(item.links)}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
