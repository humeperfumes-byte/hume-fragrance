import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import SeoEmailCapture from "@/components/SeoEmailCapture";
import { getAllProducts } from "@/lib/db/products";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
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
const SPOTLIGHT_LAYOUT_SLUGS = new Set([
  "perfume-for-office",
  "perfume-for-date-night",
  "best-date-night-perfume-men",
  "perfume-for-college",
  "perfume-for-wedding",
  "perfume-for-party",
  "perfume-for-gym",
  "perfume-for-travel",
  "perfume-for-clubbing",
  "perfume-for-first-date",
  "perfume-for-interview",
  "perfume-for-meeting",
  "perfume-for-romantic-evening",
  "perfume-for-night-out",
  "perfume-for-festival",
  "perfume-for-diwali",
  "perfume-for-holi",
  "perfume-for-eid",
  "perfume-for-rakhi",
  "perfume-for-karwa-chauth",
  "perfume-for-navratri",
  "perfume-for-durga-puja",
  "perfume-for-christmas",
  "perfume-for-new-year",
  "perfume-for-valentines-day",
]);

const SPOTLIGHT_IMAGE_BY_SLUG: Record<string, string> = {
  "perfume-for-office": "/images/occasions/office.png",
  "best-office-perfume-men": "/images/occasions/office.png",
  "perfume-for-date-night": "/images/occasions/date-night.png",
  "best-date-night-perfume-men": "/images/occasions/date-night.png",
  "perfume-for-college": "/images/occasions/college.png",
  "perfume-for-wedding": "/images/occasions/wedding.png",
  "perfume-for-party": "/images/occasions/party.png",
  "perfume-for-gym": "/images/occasions/gym.png",
  "perfume-for-travel": "/images/occasions/travel.png",
  "perfume-for-clubbing": "/images/occasions/clubbing.png",
  "perfume-for-first-date": "/images/occasions/date-night.png",
  "perfume-for-interview": "/images/occasions/office.png",
  "perfume-for-meeting": "/images/occasions/office.png",
  "perfume-for-romantic-evening": "/images/occasions/date-night.png",
  "perfume-for-night-out": "/images/occasions/party.png",
  "perfume-for-festival": "/images/occasions/diwali.png",
  "perfume-for-diwali": "/images/occasions/diwali.png",
  "perfume-for-holi": "/images/occasions/holi.png",
  "perfume-for-eid": "/images/occasions/rakhi.png",
  "perfume-for-rakhi": "/images/occasions/rakhi.png",
  "perfume-for-karwa-chauth": "/images/occasions/karwa-chauth.png",
  "perfume-for-navratri": "/images/occasions/navratri.png",
  "perfume-for-durga-puja": "/images/occasions/durga-puja.png",
  "perfume-for-christmas": "/images/occasions/chirstmas.png",
  "perfume-for-new-year": "/images/occasions/new-year.png",
  "perfume-for-valentines-day": "/images/occasions/valentines-day.png",
};
const ROUTE_CATEGORY_PREFERENCES: Record<string, string[]> = {
  "woody-perfume-men": ["woody", "sandalwood", "cedar", "vetiver"],
  "sweet-perfume-men": ["sweet", "vanilla", "tonka", "toffee", "caramel"],
  "fresh-perfume-men": ["fresh", "citrus", "aquatic", "marine", "clean"],
  "musky-perfume-men": ["musky", "musk", "white musk"],
  "spicy-perfume-men": ["spicy", "pepper", "cardamom", "cinnamon", "saffron"],
  "citrus-perfume-men": ["citrus", "bergamot", "lemon", "mandarin", "grapefruit"],
  "floral-perfume-men": ["floral", "rose", "jasmine", "lavender", "neroli"],
  "oud-perfume-men": ["oud", "agarwood", "incense", "smoky"],
  "vanilla-perfume-men": ["vanilla", "tonka", "amber", "sweet"],
  "aquatic-perfume-men": ["aquatic", "marine", "sea", "fresh"],
  "amber-perfume-men": ["amber", "amberwood", "benzoin", "labdanum"],
  "leather-perfume-men": ["leather", "suede", "smoky", "tobacco"],
  "sandalwood-perfume-men": ["sandalwood", "woody", "cedar", "musk"],
  "perfume-for-teenage-boys": ["fresh", "citrus", "aquatic", "clean"],
  "perfume-for-young-men": ["fresh", "woody", "aromatic", "versatile"],
  "perfume-for-college-guys": ["fresh", "citrus", "aquatic", "daily wear"],
  "perfume-for-working-men": ["woody", "fresh", "professional", "office"],
  "perfume-for-men-25-30": ["woody", "fresh", "amber", "versatile"],
  "perfume-for-men-30-plus": ["woody", "amber", "leather", "sophisticated"],
  "perfume-for-groom": ["amber", "woody", "sweet", "luxury"],
  "perfume-for-students": ["fresh", "citrus", "clean", "budget"],
  "perfume-for-businessmen": ["woody", "amber", "professional", "signature"],
  "perfume-for-daily-office-men": ["fresh", "woody", "office", "clean"],
  "perfume-for-office": ["fresh", "woody", "professional", "clean"],
  "best-office-perfume-men": ["fresh", "woody", "professional", "balanced"],
  "perfume-for-date-night": ["sweet", "amber", "spicy", "attractive"],
  "best-date-night-perfume-men": ["sweet", "amber", "spicy", "leather"],
  "perfume-for-college": ["fresh", "citrus", "aquatic", "daily wear"],
  "perfume-for-wedding": ["amber", "woody", "sweet", "luxury"],
  "perfume-for-party": ["spicy", "sweet", "strong", "night"],
  "perfume-for-gym": ["fresh", "aquatic", "clean", "citrus"],
  "perfume-for-travel": ["fresh", "woody", "versatile", "all season"],
  "perfume-for-clubbing": ["spicy", "sweet", "leather", "strong projection"],
  "perfume-for-daily-use": ["fresh", "woody", "versatile", "clean"],
  "perfume-for-first-date": ["fresh", "musky", "sweet", "balanced"],
  "perfume-for-interview": ["fresh", "clean", "professional", "soft projection"],
  "perfume-for-meeting": ["fresh", "woody", "professional", "balanced"],
  "perfume-for-romantic-evening": ["sweet", "amber", "musky", "intimate"],
  "perfume-for-night-out": ["spicy", "sweet", "amber", "strong"],
  "perfume-for-festival": ["amber", "woody", "spicy", "long lasting"],
  "hume-vs-sephora": ["premium-inspired", "fresh", "woody", "long lasting"],
  "hume-vs-bella-vita": ["fresh", "daily wear", "versatile", "clean"],
  "hume-vs-ajmal": ["oud", "amber", "spicy", "evening"],
  "hume-vs-arabian-aroma": ["oud", "sweet", "smoky", "strong"],
  "hume-vs-skinn-titan": ["office", "professional", "fresh", "woody"],
  "hume-vs-the-man-company": ["men", "fresh", "woody", "daily wear"],
  "hume-vs-beardo": ["spicy", "sweet", "party", "men"],
  "hume-vs-wild-stone": ["fresh", "citrus", "daily wear", "budget"],
  "hume-vs-engage": ["fresh", "clean", "daily wear", "light"],
  "hume-vs-fogg": ["deodorant", "fresh", "strong", "daily wear"],
  "hume-vs-zudio-perfume": ["fresh", "clean", "casual", "daily wear"],
  "hume-vs-miniso-perfume": ["fresh", "light", "clean", "daily wear"],
  "hume-vs-dossier": ["designer alternatives", "inspired", "long lasting", "premium"],
  "hume-vs-perfume-steal": ["clone", "inspired", "projection", "long lasting"],
  "hume-vs-latfa": ["oud", "gourmand", "sweet", "strong"],
  "hume-vs-armaf": ["projection", "fresh", "woody", "compliment"],
  "hume-vs-rasasi": ["fresh spicy", "aquatic", "long lasting", "middle eastern"],
  "hume-vs-yardley": ["clean", "floral", "everyday", "soft"],
  "hume-vs-park-avenue": ["office", "fresh", "woody", "daily wear"],
  "hume-vs-denver": ["masculine", "spicy", "fresh", "strong"],
  "hume-vs-dior-perfume": ["fresh spicy", "ambroxan", "woody", "luxury"],
  "hume-vs-chanel-perfume": ["woody aromatic", "fresh", "incense", "signature"],
  "hume-vs-tom-ford": ["oud", "leather", "amber", "luxury"],
  "hume-vs-creed-perfume": ["fresh fruity", "pineapple", "woody", "executive"],
  "hume-vs-ysl-perfume": ["fresh", "spicy", "woody", "modern"],
  "hume-vs-gucci-perfume": ["floral", "woody", "clean", "elegant"],
  "hume-vs-armani-perfume": ["aquatic", "marine", "fresh", "all season"],
  "hume-vs-versace-perfume": ["sweet", "spicy", "party", "strong projection"],
  "hume-vs-prada-perfume": ["clean", "minimal", "fresh", "office"],
  "hume-vs-bvlgari-perfume": ["citrus", "fresh", "woody", "elegant"],
  "hume-sauvage-vs-dior-sauvage": ["fresh spicy", "ambroxan", "woody", "versatile"],
  "hume-aventus-vs-creed-aventus": ["fresh fruity", "pineapple", "smoky", "woody"],
  "hume-baccarat-540-vs-baccarat-rouge-540": ["amber", "sweet", "airy", "unisex"],
  "hume-ombre-leather-vs-tom-ford-ombre-leather": ["leather", "spicy", "smoky", "warm"],
  "hume-oud-wood-vs-tom-ford-oud-wood": ["oud", "woody", "cardamom", "amber"],
  "hume-tobacco-vanille-vs-tom-ford-tobacco-vanille": ["tobacco", "vanilla", "spicy", "warm"],
  "hume-bleu-vs-bleu-de-chanel": ["woody aromatic", "fresh", "clean", "incense"],
  "hume-ysl-y-vs-ysl-y": ["fresh aromatic", "clean", "woody", "modern"],
  "hume-dylan-blue-vs-versace-dylan-blue": ["fresh", "blue", "ambroxan", "daily wear"],
  "hume-eros-vs-versace-eros": ["sweet", "mint", "party", "strong projection"],
  "hume-layton-vs-parfums-de-marly-layton": ["apple", "spicy", "amber", "luxury"],
  "hume-jazz-club-vs-replica-jazz-club": ["boozy", "tobacco", "vanilla", "woody"],
  "hume-by-the-fireplace-vs-replica-by-the-fireplace": ["smoky", "sweet", "cozy", "winter"],
  "hume-hacivat-vs-nishane-hacivat": ["citrus", "fruity", "oakmoss", "fresh"],
  "hume-red-tobacco-vs-mancera-red-tobacco": ["tobacco", "spicy", "intense", "night"],
  "dior-sauvage-vs-clone": ["fresh spicy", "ambroxan", "woody", "versatile"],
  "aventus-vs-clone": ["fresh fruity", "pineapple", "smoky", "woody"],
  "baccarat-rouge-540-vs-dupe": ["amber", "sweet", "airy", "unisex"],
  "bleu-de-chanel-vs-alternative": ["woody aromatic", "fresh", "clean", "incense"],
  "tom-ford-oud-wood-vs-clone": ["oud", "woody", "cardamom", "amber"],
  "ysl-y-vs-alternative": ["fresh aromatic", "clean", "woody", "modern"],
  "versace-eros-vs-dupe": ["sweet", "mint", "party", "strong projection"],
  "dylan-blue-vs-clone": ["fresh", "blue", "ambroxan", "daily wear"],
  "spicebomb-vs-clone": ["spicy", "tobacco", "warm", "winter"],
  "ultra-male-vs-clone": ["sweet", "spicy", "night", "strong projection"],
  "perfume-under-500-vs-under-1000": ["budget", "daily wear", "fresh", "value"],
  "perfume-under-1000-vs-under-2000": ["mid-budget", "long lasting", "versatile", "value"],
  "cheap-perfume-vs-expensive-perfume": ["value", "quality", "performance", "versatile"],
  "999-perfume-vs-10000-perfume": ["budget", "luxury", "performance", "value"],
  "budget-perfume-vs-luxury-perfume": ["value", "luxury feel", "long lasting", "versatile"],
  "attar-vs-perfume": ["attar", "oil", "traditional", "long lasting"],
  "oil-perfume-vs-spray-perfume": ["oil", "spray", "longevity", "projection"],
  "fragrance-vs-perfumes": ["fragrance terms", "perfume guide", "beginner", "selection"],
  "dio-vs-perfumes": ["deodorant", "perfume", "daily wear", "long lasting"],
  "men-perfumes-vs-women-perfumes": ["men", "women", "unisex", "note families"],
  "office-perfume-vs-party-perfume": ["office", "party", "projection", "occasion"],
  "summer-perfume-vs-winter-perfume": ["summer", "winter", "fresh", "warm"],
  "day-perfume-vs-night-perfume": ["daytime", "night", "projection", "intensity"],
  "date-perfume-vs-daily-perfume": ["date night", "daily wear", "attractive", "clean"],
  "gym-perfume-vs-office-perfume": ["gym", "office", "fresh", "professional"],
  "long-lasting-vs-strong-perfume": ["longevity", "strong projection", "sillage", "performance"],
  "edp-vs-edt": ["edp", "edt", "concentration", "performance"],
  "edp-vs-edt-parfums": ["edp", "edt", "parfum", "concentration"],
  "parfum-vs-edp": ["parfum", "edp", "longevity", "value"],
  "projection-vs-longevity-perfume": ["projection", "longevity", "performance", "guide"],
  "sillage-vs-projection": ["sillage", "projection", "perfume terms", "performance"],
  "smell-like-millionaire-vs-normal-perfume": ["luxury", "amber", "woody", "smooth"],
  "compliment-perfume-vs-regular-perfume": ["compliment", "mass appeal", "fresh", "balanced"],
  "luxury-smell-vs-budget-perfume": ["luxury", "budget", "long lasting", "value"],
  "rich-smell-vs-sweet-smell": ["rich", "sweet", "amber", "gourmand"],
  "masculine-vs-fresh-perfume": ["masculine", "fresh", "woody", "clean"],
  "bella-vita-skai-vs-armaf-club-de-nuit": ["fresh spicy", "woody", "projection", "men"],
  "lattafa-asad-vs-dior-sauvage": ["spicy", "ambroxan", "woody", "bold"],
  "armaf-club-de-nuit-vs-creed-aventus": ["fresh fruity", "pineapple", "smoky", "woody"],
  "rasasi-hawas-vs-versace-eros": ["sweet", "fresh", "party", "strong projection"],
};

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

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const tokenize = (value: string) =>
  normalizeText(value)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !["inspired", "perfume", "parfum"].includes(t));

const scoreProductByPreferences = (
  product: Awaited<ReturnType<typeof getAllProducts>>[number],
  preferences: string[]
) => {
  const categoryTokens = new Set<string>();
  (product.dbCategoryIds ?? product.categoryIds ?? [product.categoryId]).forEach((id) =>
    categoryTokens.add(normalizeText(id))
  );
  (product.dbCategoryTags ?? product.categoryTags ?? []).forEach((tag) => {
    categoryTokens.add(normalizeText(tag.id));
    if (tag.label) categoryTokens.add(normalizeText(tag.label));
  });
  categoryTokens.add(normalizeText(product.category));

  const scentText = normalizeText(
    [
      product.category,
      product.inspiration,
      product.inspirationBrand ?? "",
      product.notes.top.join(" "),
      product.notes.heart.join(" "),
      product.notes.base.join(" "),
    ].join(" ")
  );

  return preferences.reduce((score, pref) => {
    const p = normalizeText(pref);
    if (Array.from(categoryTokens).some((token) => token.includes(p) || p.includes(token))) {
      return score + 30;
    }
    if (scentText.includes(p)) return score + 12;
    return score;
  }, 0);
};

const getInspiredProductRecommendations = (
  page: { slug: string; festivalName: string; focusKeywords: string[] },
  products: Awaited<ReturnType<typeof getAllProducts>>
) => {
  const fallback = sortRecommendedProducts(products, page.focusKeywords);
  if (!page.slug.endsWith("-inspired-perfume")) return fallback.slice(0, 4);

  const target = normalizeText(page.festivalName);
  const targetTokens = tokenize(page.festivalName);

  const matched = products
    .map((product) => {
      const inspirationLine = normalizeText(
        `${product.inspirationBrand ?? ""} ${product.inspiration}`
      );
      const inspirationTokens = new Set(tokenize(`${product.inspirationBrand ?? ""} ${product.inspiration}`));
      const tokenOverlap = targetTokens.filter((t) => inspirationTokens.has(t)).length;
      const exactBoost =
        inspirationLine.includes(target) || target.includes(inspirationLine) ? 100 : 0;
      const score = exactBoost + tokenOverlap * 10;
      return { product, score };
    })
    .filter((item) => item.score >= 20)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  if (matched.length === 0) return fallback.slice(0, 4);

  const combined = [...matched, ...fallback].reduce<typeof products>((acc, product) => {
    if (!acc.some((p) => p.id === product.id)) acc.push(product);
    return acc;
  }, []);

  return combined.slice(0, 4);
};

const getSmartRecommendations = (
  page: { slug: string; festivalName: string; focusKeywords: string[] },
  products: Awaited<ReturnType<typeof getAllProducts>>
) => {
  const fallback = sortRecommendedProducts(products, page.focusKeywords);

  if (page.slug.endsWith("-inspired-perfume")) {
    return getInspiredProductRecommendations(page, products);
  }

  const preferences = ROUTE_CATEGORY_PREFERENCES[page.slug];
  if (!preferences || preferences.length === 0) return fallback.slice(0, 4);

  const ranked = products
    .map((product) => ({
      product,
      score:
        scoreProductByPreferences(product, preferences) +
        (product.badges?.humeSpecial ? 2 : 0) +
        (product.badges?.bestSeller ? 2 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  if (ranked.length === 0) return fallback.slice(0, 4);

  const combined = [...ranked, ...fallback].reduce<typeof products>((acc, product) => {
    if (!acc.some((p) => p.id === product.id)) acc.push(product);
    return acc;
  }, []);

  return combined.slice(0, 4);
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
  const recommended = getSmartRecommendations(page, products);
  const showRecommendationsEarly = true;
  const useSpotlightLayout = SPOTLIGHT_LAYOUT_SLUGS.has(page.slug);
  const spotlightImage = SPOTLIGHT_IMAGE_BY_SLUG[page.slug] ?? "/images/occasions/diwali.png";
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
          <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.22em] text-muted-foreground">Festival Fragrance Guide</p>
          <h1 className="mt-3 font-serif text-3xl md:text-6xl leading-tight max-w-4xl">{page.title}</h1>
          <p className="mt-4 md:mt-5 max-w-3xl text-[15px] md:text-lg text-muted-foreground">{page.intro}</p>
          <div className="mt-4 rounded-md border border-border bg-card p-4 max-w-3xl">
            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Quick Answer</p>
            <p className="text-sm text-muted-foreground">
              For {page.festivalName}, pick a {page.styleKeywords.slice(0, 2).join(" and ")} profile with 8-10 hour comfort in Indian weather. Start with balanced projection fragrances and choose richer notes for evening events.
            </p>
          </div>

          <div className="mt-8 md:mt-10 grid gap-4 md:gap-6 md:grid-cols-3">
            <div className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-5">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.22em] text-muted-foreground">Primary Intent</p>
              <p className="mt-2 text-[15px] md:text-base font-medium">Festival-ready perfume recommendations</p>
            </div>
            <div className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-5">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.22em] text-muted-foreground">Performance Goal</p>
              <p className="mt-2 text-[15px] md:text-base font-medium">Comfortable 8–10 hour wear in Indian weather</p>
            </div>
            <div className="rounded-xl md:rounded-2xl border border-border bg-card p-4 md:p-5">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.22em] text-muted-foreground">Style Direction</p>
              <p className="mt-2 text-[15px] md:text-base font-medium">{page.styleKeywords.join(", ")}</p>
            </div>
          </div>
        </div>
      </section>

      {showRecommendationsEarly && (
        <section className="pb-16">
          <div className="container-custom px-4 sm:px-6 lg:px-10">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.22em] text-muted-foreground">Recommendations</p>
                <h2 className="mt-2 font-serif text-4xl">Perfume picks for {page.festivalName}</h2>
              </div>
              <Link href="/shop" className="text-sm uppercase tracking-[0.18em] border-b border-foreground/20 pb-1 hover:border-foreground">
                Shop All
              </Link>
            </div>

            {useSpotlightLayout ? (
              <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-start">
                <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-card">
                  <Image
                    src={withCloudinaryTransforms(spotlightImage, { width: 680 })}
                    alt={`${page.festivalName} fragrance mood`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 340px"
                    priority
                    fetchPriority="high"
                    quality={60}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/80">Occasion Edit</p>
                    <p className="mt-1 font-serif text-2xl text-white leading-tight">{page.festivalName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
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
            ) : (
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
            )}
          </div>
        </section>
      )}

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

      {!showRecommendationsEarly && (
      <section className="pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.22em] text-muted-foreground">Recommendations</p>
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
      )}

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
