import type { PerfumeData } from "../data/perfumes";

export const INVICTUS_REFERENCE_URL = "https://www.rabanne.com/es/es_ES/fragrance/p/invictus--000000000065055742";
export const INVICTUS_IMAGE_PLACEHOLDER = "/images/logo.png";
export const INVICTUS_PRODUCT: PerfumeData = {
  id: "invictus", name: "Invictus", inspiration: "Invictus Eau de Toilette", inspirationBrand: "Rabanne",
  visibility: "public", category: "Fresh / Aquatic / Woody", categoryId: "fresh", gender: "Men",
  images: [INVICTUS_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Invictus is a 50ml perfume inspired by the original Rabanne Invictus Eau de Toilette, also known as Paco Rabanne Invictus, priced at INR 799. It explores a fresh marine and woody direction with grapefruit, a marine accord and guaiac wood scent descriptors. This is a HUME inspired alternative, not an original Rabanne perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Invictus, a 50ml perfume inspired by Paco Rabanne Invictus Eau de Toilette for INR 799. Discover its fresh marine, woody direction and availability.",
  seoKeywords: ["HUME Invictus", "Paco Rabanne Invictus inspired perfume", "Rabanne Invictus EDT alternative India", "grapefruit marine perfume", "fresh aquatic woody perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Official EDT inspiration scent descriptors, not verified HUME formula ingredients.
  notes: { top: ["Grapefruit"], heart: ["Marine Accord"], base: ["Guaiac Wood", "Patchouli", "Ambergris Accord"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Spring", "Summer"], occasion: ["Daytime", "Office", "Casual"] },
  reviews: [],
};
export function getInvictusFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Invictus inspired by?", answer: "HUME Invictus is inspired by the original Rabanne Invictus Eau de Toilette, also searched as Paco Rabanne Invictus EDT. It is a HUME fragrance, not an original Rabanne product, and is not affiliated with that brand." },
    { question: "What scent profile does Invictus explore?", answer: "The EDT inspiration combines grapefruit and a marine accord with guaiac wood, patchouli and an ambergris direction. These scent descriptors describe the inspiration profile rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by Invictus EDT, Victory or Parfum?", answer: "This product is inspired specifically by the original Invictus Eau de Toilette. Invictus Victory, Victory Elixir, Aqua and Parfum are separate versions." },
    { question: "What is the price and bottle size?", answer: `HUME Invictus is ${product.size}, listed at INR ${product.price ?? INVICTUS_PRODUCT.price}.` },
    { question: "Is HUME Invictus available to order?", answer: product.badges?.soldOut ? "Invictus is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Invictus last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
