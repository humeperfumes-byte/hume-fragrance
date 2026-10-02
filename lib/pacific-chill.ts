import type { PerfumeData } from "../data/perfumes";

export const PACIFIC_CHILL_REFERENCE_URL = "https://in.louisvuitton.com/eng-in/products/pacific-chill-nvprod7220018v/LP0461";
export const PACIFIC_CHILL_IMAGE_PLACEHOLDER = "/images/logo.png";

export const PACIFIC_CHILL_PRODUCT: PerfumeData = {
  id: "pacific-chill",
  name: "Pacific Chill",
  inspiration: "Pacific Chill",
  inspirationBrand: "Louis Vuitton",
  visibility: "public",
  category: "Fresh / Citrus / Fruity",
  categoryId: "fresh",
  gender: "Unisex",
  images: [PACIFIC_CHILL_IMAGE_PLACEHOLDER],
  price: 799,
  priceCurrency: "INR",
  size: "50ml",
  description: "HUME Pacific Chill is a 50ml unisex perfume inspired by Louis Vuitton Pacific Chill, priced at INR 799. Its inspiration explores fresh citrus, blackcurrant and cooling aromatic notes, with a soft fruity character. This is a HUME inspired alternative, not an original Louis Vuitton perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Pacific Chill, a 50ml unisex perfume inspired by Louis Vuitton Pacific Chill for INR 799. Discover its fresh citrus-fruity direction and availability.",
  seoKeywords: ["HUME Pacific Chill", "Louis Vuitton Pacific Chill inspired perfume", "LV Pacific Chill alternative India", "Pacific Chill inspired fragrance", "fresh citrus fruity perfume", "unisex summer perfume India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Scent descriptors drawn from LV's product page and Pacific Chill story.
  // Groups describe the inspiration, not a verified HUME ingredient pyramid.
  notes: {
    top: ["Blackcurrant", "Citron", "Lemon", "Orange", "Peppermint"],
    heart: ["Carrot Seeds", "Basil Seeds", "Coriander"],
    base: ["Ambrette"],
  },
  longevity: {
    duration: "Varies with skin, weather and application; wear-test results pending",
    sillage: "Wear-test results pending",
    season: ["Spring", "Summer"],
    occasion: ["Daily Wear", "Casual", "Travel", "Daytime"],
  },
  reviews: [],
};

export function getPacificChillFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Pacific Chill inspired by?", answer: "HUME Pacific Chill is inspired by Louis Vuitton Pacific Chill. It is a HUME fragrance, not an original Louis Vuitton product, and is not affiliated with Louis Vuitton." },
    { question: "What scent profile does Pacific Chill explore?", answer: "The inspiration combines blackcurrant and citrus with cooling peppermint and aromatic accents. Louis Vuitton highlights blackcurrant, citron and carrot seeds; the note names describe a scent profile, not HUME's ingredient list." },
    { question: "Who might enjoy HUME Pacific Chill?", answer: "Its fresh citrus-fruity direction is a starting point for people exploring daytime, casual or warm-weather fragrances. Preferences and performance vary; this is scent-selection guidance rather than a tested performance guarantee." },
    { question: "What is the price and bottle size?", answer: `HUME Pacific Chill is ${product.size}, listed at INR ${product.price ?? PACIFIC_CHILL_PRODUCT.price}.` },
    { question: "Is HUME Pacific Chill available to order?", answer: product.badges?.soldOut ? "Pacific Chill is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Pacific Chill last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
