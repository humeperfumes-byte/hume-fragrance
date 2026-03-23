import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo";
import {
  getAllProgrammaticAlternatives,
  getAllProgrammaticInspirations,
} from "@/lib/programmatic-seo";
import { FESTIVAL_SEO_PAGES } from "@/lib/festival-seo";

const baseUrl = "https://humefragrance.com";

export const metadata: Metadata = {
  title: "Fragrance Guides Hub | HUME",
  description:
    "Browse all HUME fragrance guides: occasion picks, inspired alternatives, budget lists, and note-based recommendations.",
  alternates: {
    canonical: `${baseUrl}/fragrance-guides`,
  },
};

type LinkItem = { href: string; label: string };

function section(title: string, links: LinkItem[]) {
  return { title, links };
}

function prettyFromSlug(slug: string) {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

export default function FragranceGuidesHubPage() {
  const occasionGuides = FESTIVAL_SEO_PAGES.filter(
    (item) => item.slug.startsWith("perfume-for-") || item.slug.startsWith("best-office-perfume")
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const budgetGuides = FESTIVAL_SEO_PAGES.filter(
    (item) => item.slug.includes("under-") || item.slug.includes("budget")
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const noteGuides = FESTIVAL_SEO_PAGES.filter(
    (item) => item.slug.endsWith("-perfume-men")
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const performanceGuides = FESTIVAL_SEO_PAGES.filter(
    (item) =>
      item.slug.includes("long-lasting") ||
      item.slug.includes("lasting") ||
      item.slug.includes("projection") ||
      item.slug.includes("sillage") ||
      item.slug.includes("beast-mode")
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const inspiredGuides = FESTIVAL_SEO_PAGES.filter((item) =>
    item.slug.endsWith("-inspired-perfume")
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const compareAndEducation = FESTIVAL_SEO_PAGES.filter(
    (item) =>
      item.slug.includes("-vs-") ||
      item.slug.startsWith("how-to-") ||
      item.slug.startsWith("where-to-") ||
      item.slug.includes("explained") ||
      item.slug.includes("guide")
  ).map((item) => ({ href: `/${item.slug}`, label: item.title }));

  const programmaticInspired = getAllProgrammaticInspirations().map((item) => ({
    href: `/inspired-by/${item.slug}`,
    label: `Inspired by ${item.originalBrand} ${item.originalName}`,
  }));

  const programmaticAlternatives = getAllProgrammaticInspirations().map((item) => ({
    href: `/alternatives-to/${item.slug}`,
    label: `Alternative to ${item.originalName}`,
  }));

  const programmaticBest = getAllProgrammaticAlternatives().map((item) => ({
    href: `/best/${item.slug}`,
    label: item.title || prettyFromSlug(item.slug),
  }));

  const sections = [
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
    { href: "/best-perfume-for-men-india", label: "Best Perfume for Men India" },
    { href: "/long-lasting-perfume-men-india", label: "Long Lasting Perfume Men India" },
    { href: "/perfume-for-office", label: "Perfume for Office" },
    { href: "/perfume-for-date-night", label: "Perfume for Date Night" },
    { href: "/dior-sauvage-inspired-perfume", label: "Dior Sauvage Inspired Perfume" },
    { href: "/replica-jazz-club-inspired-perfume", label: "Replica Jazz Club Inspired Perfume" },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Fragrance Guides Hub | HUME",
      url: `${baseUrl}/fragrance-guides`,
      description:
        "Hub page linking all HUME fragrance guides, alternatives, inspired pages and seasonal recommendations.",
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
          <p className="text-caption text-muted-foreground mb-2">Internal Link Hub</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Fragrance Guides</h1>
          <p className="text-body text-muted-foreground max-w-3xl">
            This hub links all searchable fragrance landing pages so crawlers and users can discover every relevant guide.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Total indexed-target links listed here: <span className="font-medium text-foreground">{totalLinks}</span>
          </p>
          <div className="mt-8 rounded-[28px] border border-border/60 bg-gradient-to-b from-white to-secondary/20 p-6 shadow-[0_18px_45px_rgba(15,15,20,0.04)]">
            <p className="text-caption text-muted-foreground mb-3">Quick Answer</p>
            <p className="text-body text-foreground max-w-4xl leading-relaxed">
              If you are looking for the best HUME pages for search, AI assistants, and product discovery,
              start with broad recommendation hubs, then move into inspired-by, alternatives-to, budget, note-family,
              and comparison pages before landing on the final product page.
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
