import type { PerfumeData } from "../data/perfumes";

export const MOST_WANTED_REFERENCE_URL = "https://www.azzaro.com/en/fragrances/azzaro-the-most-wanted/parfum";
export const MOST_WANTED_IMAGE_PLACEHOLDER = "/images/logo.png";
export const MOST_WANTED_PRODUCT: PerfumeData = {
  id: "most-wanted", name: "Most Wanted", inspiration: "The Most Wanted Parfum", inspirationBrand: "Azzaro",
  visibility: "public", category: "Spicy / Woody / Vanilla", categoryId: "woody", gender: "Men",
  images: [MOST_WANTED_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Most Wanted is a 50ml perfume inspired by Azzaro The Most Wanted Parfum, priced at INR 799. It explores a warm spicy, woody vanilla direction with red ginger, woods and Bourbon vanilla scent descriptors. This is a HUME inspired alternative, not an original Azzaro perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Most Wanted, a 50ml perfume inspired by Azzaro The Most Wanted Parfum for INR 799. Discover its warm spicy, woody vanilla direction and availability.",
  seoKeywords: ["HUME Most Wanted", "Azzaro Most Wanted inspired perfume", "The Most Wanted Parfum alternative India", "ginger vanilla perfume", "woody spicy perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Inspiration scent descriptors, not verified HUME formula ingredients.
  notes: { top: ["Red Ginger"], heart: ["Woods"], base: ["Bourbon Vanilla"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getMostWantedFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Most Wanted inspired by?", answer: "HUME Most Wanted is inspired by Azzaro The Most Wanted Parfum. It is a HUME fragrance, not an original Azzaro product, and is not affiliated with that brand." },
    { question: "What scent profile does Most Wanted explore?", answer: "The inspiration explores warm spice, woods and vanilla, described through red ginger, woody notes and Bourbon vanilla. These scent descriptors describe the inspiration direction rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by The Most Wanted Parfum or Eau de Parfum Intense?", answer: "This product is inspired by The Most Wanted Parfum. Azzaro's Eau de Parfum Intense is a separate version; its scent profile should not be substituted for this reference." },
    { question: "What is the price and bottle size?", answer: `HUME Most Wanted is ${product.size}, listed at INR ${product.price ?? MOST_WANTED_PRODUCT.price}.` },
    { question: "Is HUME Most Wanted available to order?", answer: product.badges?.soldOut ? "Most Wanted is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Most Wanted last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
