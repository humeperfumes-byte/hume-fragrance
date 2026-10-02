import type { PerfumeData } from "../data/perfumes";

export const ONE_MILLION_REFERENCE_URL = "https://www.rabanne.com/es/es_ES/fragrance/p/1-million--000000000065051844_BASE";
export const ONE_MILLION_IMAGE_PLACEHOLDER = "/images/logo.png";
export const ONE_MILLION_PRODUCT: PerfumeData = {
  id: "1-million", name: "1 Million", inspiration: "1 Million Eau de Toilette", inspirationBrand: "Rabanne",
  visibility: "public", category: "Spicy / Woody / Amber", categoryId: "spicy", gender: "Men",
  images: [ONE_MILLION_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME 1 Million is a 50ml perfume inspired by Rabanne 1 Million Eau de Toilette, priced at INR 799. It explores a fresh spicy, woody amber direction with blood mandarin, cinnamon and leathery amber scent descriptors. This is a HUME inspired alternative, not an original Rabanne perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME 1 Million, a 50ml perfume inspired by Rabanne 1 Million Eau de Toilette for INR 799. Discover its mandarin, cinnamon, leathery amber direction and availability.",
  seoKeywords: ["HUME 1 Million", "Rabanne 1 Million EDT inspired perfume", "Paco Rabanne 1 Million alternative India", "mandarin cinnamon perfume", "spicy leather amber perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // EDT reference scent descriptors, not verified HUME formula ingredients.
  notes: { top: ["Blood Mandarin"], heart: ["Woody Cinnamon"], base: ["Leathery Amber"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getOneMillionFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME 1 Million inspired by?", answer: "HUME 1 Million is inspired by Rabanne 1 Million Eau de Toilette, also searched as Paco Rabanne 1 Million EDT. It is a HUME fragrance, not an original Rabanne product, and is not affiliated with that brand." },
    { question: "What scent profile does 1 Million explore?", answer: "The EDT inspiration combines blood mandarin, woody cinnamon and leathery amber. These scent descriptors describe the inspiration profile rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by 1 Million EDT, Parfum or Elixir?", answer: "This product is inspired specifically by the original 1 Million Eau de Toilette. 1 Million Parfum, Elixir and Lucky are separate versions." },
    { question: "What is the price and bottle size?", answer: `HUME 1 Million is ${product.size}, listed at INR ${product.price ?? ONE_MILLION_PRODUCT.price}.` },
    { question: "Is HUME 1 Million available to order?", answer: product.badges?.soldOut ? "1 Million is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME 1 Million last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
