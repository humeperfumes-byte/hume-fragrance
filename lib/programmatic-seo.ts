import programmaticSeoData from "@/data/programmatic-seo.json";

export interface ProgrammaticInspiration {
  slug: string;
  originalName: string;
  originalBrand: string;
  humeProduct: {
    slug: string;
    note: string;
  };
  availability?: "available" | "demand_validation";
  demand_note?: string;
  scent_profile: {
    family: string;
    top_notes: string[];
    heart_notes: string[];
    base_notes: string[];
  };
  characteristics: {
    longevity: string;
    projection: string;
    seasons: string[];
    occasions: string[];
  };
  why_inspired: string;
  what_makes_original_iconic: string;
  how_hume_captures_essence: string;
  formulated_for_india: string;
  original_price: number;
  savings: number;
}

export interface ProgrammaticAlternative {
  slug: string;
  title: string;
  targetKeyword: string;
  humeProducts: string[];
  searchIntent: string;
  monthlySearches: number;
  difficulty: string;
  intro: string;
  why_this_matters: string;
}

type ProgrammaticSeoData = {
  inspirations: ProgrammaticInspiration[];
  alternatives: ProgrammaticAlternative[];
};

const data = programmaticSeoData as ProgrammaticSeoData;

export const HIGH_INTENT_INSPIRED_BY_SLUGS = [
  "mancera-red-tobacco",
  "amouage-interlude-man",
  "tom-ford-ombre-leather",
  "acqua-di-gio-profondo",
  "initio-oud-for-greatness",
  "tom-ford-tobacco-vanille",
  "xerjoff-naxos",
  "parfums-de-marly-layton",
  "nishane-hacivat",
  "bvlgari-tygar",
  "louis-vuitton-ombre-nomade",
  "louis-vuitton-imagination",
  "amouage-outlands",
  "afnan-supremacy-collectors-edition-pour-homme",
  "kilian-angels-share-paradis",
  "armani-stronger-with-you-absolutely",
  "terre-dhermes-intense",
  "ex-nihilo-blue-talisman-extrait-de-parfum",
  "jean-paul-gaultier-le-male-elixir-absolu",
  "byredo-bal-dafrique-absolu",
  "viktor-rolf-spicebomb-metallic-musk",
  "french-avenue-liquid-brun",
  "creed-absolu-aventus",
  "hugo-boss-bottled-absolu",
  "dior-fahrenheit",
  "parfums-de-marly-althair",
] as const;

export const getAllProgrammaticInspirations = () => data.inspirations;

export const getProgrammaticInspirationBySlug = (slug: string) =>
  data.inspirations.find((item) => item.slug === slug);

export const getHighIntentProgrammaticInspirations = () => {
  const bySlug = new Map(data.inspirations.map((item) => [item.slug, item]));
  return HIGH_INTENT_INSPIRED_BY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (item): item is ProgrammaticInspiration => Boolean(item),
  );
};

export const getAllProgrammaticAlternatives = () => data.alternatives;

export const getProgrammaticAlternativeBySlug = (slug: string) =>
  data.alternatives.find((item) => item.slug === slug);

export const getAlternativeToBySlug = (slug: string) =>
  data.inspirations.find((item) => item.slug === slug);

export function buildInspiredFaq(item: ProgrammaticInspiration) {
  const isDemandValidation = item.availability === "demand_validation";

  return [
    {
      question: `How long does this ${item.originalName} inspired perfume last?`,
      answer: `Expected wear is ${item.characteristics.longevity} with ${item.characteristics.projection.toLowerCase()} projection, depending on weather and skin type.`,
    },
    {
      question: `Is this similar to ${item.originalBrand} ${item.originalName}?`,
      answer: isDemandValidation
        ? "This is a demand-watch page for the scent direction. HUME shows the closest current style while deciding whether to create a dedicated version."
        : "It follows the same scent family and note direction while being priced for daily use in India.",
    },
    {
      question: "Is this suitable for Indian weather?",
      answer: item.formulated_for_india,
    },
    {
      question: isDemandValidation
        ? "Is this exact HUME perfume available now?"
        : "Where can I buy the full product?",
      answer: isDemandValidation
        ? "Not yet. This page tracks interest for a possible future HUME release, and the closest current HUME style is linked on the page."
        : "You can order it directly from the linked product section on this page.",
    },
  ];
}

export function buildBestPageFaq(item: ProgrammaticAlternative) {
  return [
    {
      question: `What is the best option for ${item.targetKeyword}?`,
      answer:
        "Choose based on your preferred note family, weather, and occasion. This page highlights practical picks with strong value.",
    },
    {
      question: "Do these options last in Indian heat?",
      answer:
        "Yes, listed picks focus on EDP-style longevity and base-note strength suitable for Indian conditions.",
    },
    {
      question: "Can I wear these daily?",
      answer:
        "Most recommendations are versatile enough for office and casual use; heavier options are better for evenings.",
    },
  ];
}

export function getProgrammaticSitemapEntries(baseUrl: string) {
  const highIntentSlugs = new Set<string>(HIGH_INTENT_INSPIRED_BY_SLUGS);
  const inspired = data.inspirations.map((item) => ({
    url: `${baseUrl}/inspired-by/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: highIntentSlugs.has(item.slug) ? ("weekly" as const) : ("monthly" as const),
    priority: highIntentSlugs.has(item.slug) ? 0.85 : 0.7,
  }));

  const alternativesTo = data.inspirations.map((item) => ({
    url: `${baseUrl}/alternatives-to/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: highIntentSlugs.has(item.slug) ? ("weekly" as const) : ("monthly" as const),
    priority: highIntentSlugs.has(item.slug) ? 0.8 : 0.7,
  }));

  const best = data.alternatives.map((item) => ({
    url: `${baseUrl}/best/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...inspired, ...alternativesTo, ...best];
}
