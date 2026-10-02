import type { PerfumeData } from "../data/perfumes";

export const HER_REFERENCE_URL = "https://uk.burberry.com/c/burberry-her/";
export const HER_IMAGE_PLACEHOLDER = "/images/logo.png";
export const HER_PRODUCT: PerfumeData = {
  id: "her", name: "Her", inspiration: "Burberry Her", inspirationBrand: "Burberry",
  visibility: "public", category: "Fruity / Floral / Gourmand", categoryId: "fruity", gender: "Women",
  images: [HER_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Her is a 50ml perfume inspired by the original Burberry Her Eau de Parfum, priced at INR 799. It explores a fruity floral gourmand direction with berries, violet, jasmine, woods and creamy amber scent descriptors. This is a HUME inspired alternative, not an original Burberry perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Her, a 50ml perfume inspired by Burberry Her Eau de Parfum for INR 799. Discover its fruity floral gourmand direction and current availability.",
  seoKeywords: ["HUME Her", "Burberry Her inspired perfume", "Burberry Her alternative India", "berry floral perfume", "fruity gourmand perfume for women India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Original inspiration scent descriptors; not verified HUME formula ingredients.
  notes: { top: ["Berries"], heart: ["Violet", "Jasmine"], base: ["Woods", "Creamy Amber"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Spring", "Summer", "Autumn"], occasion: ["Daytime", "Casual", "Date Night"] },
  reviews: [],
};
export function getHerFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Her inspired by?", answer: "HUME Her is inspired by the original Burberry Her Eau de Parfum. It is a HUME fragrance, not an original Burberry product, and is not affiliated with that brand." },
    { question: "What scent profile does Her explore?", answer: "The inspiration explores berries, violet and jasmine with woods and creamy amber. These scent descriptors describe the inspiration direction rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by Burberry Her or Her Elixir?", answer: "This product is inspired by the original Burberry Her Eau de Parfum. Her Elixir and other Her editions are separate fragrances." },
    { question: "What is the price and bottle size?", answer: `HUME Her is ${product.size}, listed at INR ${product.price ?? HER_PRODUCT.price}.` },
    { question: "Is HUME Her available to order?", answer: product.badges?.soldOut ? "Her is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Her last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
