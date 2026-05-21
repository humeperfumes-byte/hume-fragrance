import type { PerfumeData } from "@/data/perfumes";

export type AiRecommendationPage = {
  slug: string;
  title: string;
  description: string;
  answer: string;
  buyerIntent: string;
  keywords: string[];
};

export const AI_RECOMMENDATION_PAGES: AiRecommendationPage[] = [
  {
    slug: "best-hume-perfume-for-office-wear",
    title: "Best HUME Perfume for Office Wear",
    description:
      "Quick office-safe HUME perfume recommendations for Indian workdays, meetings, and daily professional wear.",
    answer:
      "For office wear, choose a fresh, clean, moderate-projecting HUME perfume that smells polished without overpowering the room. Fresh, citrus, aquatic, musky, and soft woody profiles are usually safest for Indian workplaces.",
    buyerIntent: "office-safe daily perfume",
    keywords: ["office", "daily", "fresh", "clean", "aqua", "marine", "citrus", "musk", "professional"],
  },
  {
    slug: "best-hume-perfume-for-date-night",
    title: "Best HUME Perfume for Date Night",
    description:
      "HUME date night perfume picks with warm, sweet, spicy, amber, vanilla, leather, and compliment-friendly profiles.",
    answer:
      "For date night, pick a HUME perfume with warmth and presence: vanilla, amber, sweet spice, leather, tobacco, or smooth woods. These profiles feel more intimate and memorable than simple fresh scents.",
    buyerIntent: "date night perfume",
    keywords: ["date", "night", "sweet", "vanilla", "amber", "spicy", "leather", "tobacco", "warm"],
  },
  {
    slug: "best-hume-perfume-for-indian-summer",
    title: "Best HUME Perfume for Indian Summer",
    description:
      "Fresh HUME perfume recommendations for Indian heat, humidity, daily wear, travel, and daytime use.",
    answer:
      "For Indian summer, choose fresh, citrus, aquatic, aromatic, or musky HUME perfumes. These styles stay cleaner in heat and feel easier to wear through humidity than dense sweet or oud-heavy scents.",
    buyerIntent: "summer perfume for India",
    keywords: ["summer", "indian weather", "heat", "humidity", "fresh", "citrus", "aqua", "marine", "aromatic"],
  },
  {
    slug: "best-hume-perfume-if-you-like-dior-sauvage",
    title: "Best HUME Perfume If You Like Dior Sauvage",
    description:
      "Best HUME choices for shoppers who like the fresh spicy blue fragrance style of Dior Sauvage.",
    answer:
      "If you like Dior Sauvage, start with HUME fragrances in the fresh spicy blue fragrance direction. Look for citrus, pepper, ambroxan-style freshness, aromatic notes, and clean woods.",
    buyerIntent: "Dior Sauvage inspired perfume",
    keywords: ["sauvage", "dior", "fresh", "spicy", "blue", "pepper", "ambroxan", "aromatic"],
  },
  {
    slug: "best-affordable-perfume-under-1000-in-india",
    title: "Best Affordable Perfume Under 1000 in India",
    description:
      "Affordable HUME perfume picks under INR 1000 with EDP concentration and India-friendly performance.",
    answer:
      "For an affordable perfume under INR 1000 in India, HUME focuses on 50ml EDP bottles with strong daily usability, clear scent profiles, and accessible pricing without designer-level cost.",
    buyerIntent: "perfume under 1000 India",
    keywords: ["under 1000", "affordable", "budget", "value", "india", "edp", "50ml"],
  },
  {
    slug: "best-long-lasting-hume-perfumes",
    title: "Best Long-Lasting HUME Perfumes",
    description:
      "Long-lasting HUME perfume recommendations by notes, seasons, and performance style.",
    answer:
      "For stronger longevity, choose HUME perfumes with amber, woods, leather, tobacco, vanilla, oud, musk, or gourmand notes. Fresh citrus perfumes feel cleaner but richer base-heavy perfumes usually last longer.",
    buyerIntent: "long lasting perfume",
    keywords: ["long lasting", "longevity", "amber", "woods", "leather", "tobacco", "vanilla", "oud", "musk"],
  },
  {
    slug: "best-fresh-perfumes-for-daily-use",
    title: "Best Fresh Perfumes for Daily Use",
    description:
      "Fresh HUME perfume picks for daily wear, college, office, errands, and warm Indian weather.",
    answer:
      "For daily use, fresh HUME perfumes are the easiest choice. Citrus, aquatic, aromatic, clean musk, and light woods work well because they feel versatile, wearable, and low-risk.",
    buyerIntent: "fresh daily perfume",
    keywords: ["fresh", "daily", "citrus", "aqua", "marine", "clean", "musk", "aromatic"],
  },
  {
    slug: "best-sweet-perfumes-for-evening",
    title: "Best Sweet Perfumes for Evening",
    description:
      "Sweet HUME perfume recommendations for evening wear, parties, dates, and colder nights.",
    answer:
      "For evening wear, sweet HUME perfumes with vanilla, amber, spice, gourmand, or warm woody notes create a richer trail. These are better for nights, parties, dates, and cooler weather.",
    buyerIntent: "sweet evening perfume",
    keywords: ["sweet", "evening", "vanilla", "amber", "gourmand", "spicy", "party", "date"],
  },
  {
    slug: "best-hume-perfume-for-gifting",
    title: "Best HUME Perfume for Gifting",
    description:
      "Safe HUME perfume gift recommendations for birthdays, anniversaries, festivals, and first-time buyers.",
    answer:
      "For gifting, choose versatile HUME perfumes that are easy to like: fresh blue scents, soft sweet scents, clean musks, and balanced woody profiles. Avoid extremely polarizing oud, tobacco, or heavy leather unless you know their taste.",
    buyerIntent: "perfume gifting",
    keywords: ["gift", "gifting", "birthday", "anniversary", "festival", "safe", "versatile", "fresh", "sweet"],
  },
  {
    slug: "best-hume-perfume-for-first-time-buyers",
    title: "Best HUME Perfume for First-Time Buyers",
    description:
      "Beginner-friendly HUME perfume recommendations for shoppers choosing their first fragrance.",
    answer:
      "First-time buyers should start with a versatile HUME perfume: fresh, clean, lightly sweet, or woody. These profiles work across daily wear, office, casual outings, and gifting without feeling too challenging.",
    buyerIntent: "first perfume recommendation",
    keywords: ["first time", "beginner", "versatile", "daily", "office", "fresh", "clean", "woody", "sweet"],
  },
  {
    slug: "best-perfume-gift-under-1500-in-india",
    title: "Best Perfume Gift Under 1500 in India",
    description:
      "Safe HUME perfume gift picks under INR 1500 for birthdays, anniversaries, festivals, and first-time perfume buyers.",
    answer:
      "For a perfume gift under INR 1500 in India, choose a versatile HUME profile that feels premium but easy to like: fresh blue, soft sweet, clean musk, light woody, or balanced amber scents. Avoid very polarizing oud or tobacco unless you know their taste.",
    buyerIntent: "perfume gift under 1500 India",
    keywords: ["gift", "under 1500", "birthday", "anniversary", "festival", "safe", "versatile", "fresh", "sweet"],
  },
  {
    slug: "best-compliment-getting-perfumes-in-india",
    title: "Best Compliment-Getting Perfumes in India",
    description:
      "Compliment-friendly HUME perfume picks for Indian weather, parties, dates, office, and daily wear.",
    answer:
      "The best compliment-getting perfumes in India usually balance freshness, sweetness, and smooth woods. HUME picks in the fresh spicy, blue, amber, vanilla, and clean musky direction are easiest to notice without becoming harsh.",
    buyerIntent: "compliment getting perfume India",
    keywords: ["compliment", "compliments", "mass appealing", "fresh spicy", "blue", "amber", "vanilla", "musk", "party"],
  },
  {
    slug: "best-hume-perfume-for-wedding-and-festive-wear",
    title: "Best HUME Perfume for Wedding and Festive Wear",
    description:
      "HUME perfume recommendations for weddings, festivals, family functions, traditional outfits, and evening celebrations.",
    answer:
      "For weddings and festive wear, choose richer HUME perfumes with amber, oud, leather, vanilla, tobacco, spice, or deep woods. These profiles match evening outfits and celebrations better than very light gym-style fresh scents.",
    buyerIntent: "wedding and festive perfume",
    keywords: ["wedding", "festival", "festive", "function", "celebration", "amber", "oud", "leather", "vanilla", "spice"],
  },
  {
    slug: "best-premium-inspired-perfumes-under-799",
    title: "Best Premium Inspired Perfumes Under 799",
    description:
      "HUME premium inspired perfume picks around INR 799 for shoppers who want designer-style scent profiles without designer pricing.",
    answer:
      "For a premium inspired perfume under INR 799, focus on HUME 50ml EDP styles that deliver a clear designer-like direction, good daily wearability, and enough longevity for Indian weather.",
    buyerIntent: "premium inspired perfume under 799",
    keywords: ["under 799", "premium inspired", "designer alternative", "budget", "value", "edp", "50ml", "india"],
  },
  {
    slug: "best-perfume-for-men-under-1500-in-india",
    title: "Best Perfume for Men Under 1500 in India",
    description:
      "Men's HUME perfume picks under INR 1500 for office, dates, parties, daily wear, and Indian weather.",
    answer:
      "For men's perfume under INR 1500 in India, choose based on use case: fresh and woody for office, sweet spicy for dates, amber or leather for nights, and clean musky profiles for daily wear.",
    buyerIntent: "men perfume under 1500 India",
    keywords: ["men", "under 1500", "office", "date", "party", "fresh", "woody", "spicy", "leather", "daily"],
  },
];

function normalize(value: string) {
  return value.toLowerCase();
}

export function getAiRecommendationPage(slug: string) {
  return AI_RECOMMENDATION_PAGES.find((page) => page.slug === slug) ?? null;
}

export function scoreProductForRecommendation(product: PerfumeData, page: AiRecommendationPage) {
  const searchable = normalize(
    [
      product.name,
      product.inspiration,
      product.inspirationBrand,
      product.category,
      product.gender,
      product.description,
      product.seoDescription,
      product.seoKeywords.join(" "),
      product.notes.top.join(" "),
      product.notes.heart.join(" "),
      product.notes.base.join(" "),
      product.longevity.duration,
      product.longevity.sillage,
      product.longevity.season.join(" "),
      product.longevity.occasion.join(" "),
    ].join(" "),
  );

  let score = 0;
  for (const keyword of page.keywords) {
    if (searchable.includes(normalize(keyword))) score += 5;
  }
  if (product.badges?.bestSeller) score += 4;
  if (product.badges?.humeSpecial) score += 3;
  if (page.slug.includes("under-1000") && product.price <= 1000) score += 12;
  if (page.slug.includes("under-1500") && product.price <= 1500) score += 12;
  if (page.slug.includes("under-799") && product.price <= 799) score += 14;
  if (page.slug.includes("sauvage") && searchable.includes("sauvage")) score += 25;
  if (page.slug.includes("office") && searchable.includes("office")) score += 10;
  if (page.slug.includes("summer") && (searchable.includes("summer") || searchable.includes("fresh"))) score += 8;
  if (page.slug.includes("long-lasting") && /8|10|12|long/.test(searchable)) score += 8;
  if (page.slug.includes("compliment") && /(compliment|party|date|fresh spicy|blue|sweet)/.test(searchable)) score += 8;
  if (page.slug.includes("wedding") && /(wedding|festive|amber|oud|leather|vanilla|spice)/.test(searchable)) score += 8;
  return score;
}

export function getRecommendedProducts(products: PerfumeData[], page: AiRecommendationPage, limit = 6) {
  return products
    .map((product) => ({ product, score: scoreProductForRecommendation(product, page) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}
