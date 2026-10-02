import type { PerfumeData } from "../data/perfumes";

export const LA_NUIT_REFERENCE_URL = "https://www.yslbeauty.com/int/fragrance/fragrance-for-him/la-nuit-de-l-homme/la-nuit-de-l-homme-eau-de-toilette/426YSL.html";
export const LA_NUIT_IMAGE_PLACEHOLDER = "/images/logo.png";
export const LA_NUIT_PRODUCT: PerfumeData = {
  id: "la-nuit", name: "La Nuit", inspiration: "La Nuit de L'Homme Eau de Toilette", inspirationBrand: "Yves Saint Laurent",
  visibility: "public", category: "Spicy / Aromatic / Woody", categoryId: "spicy", gender: "Men",
  images: [LA_NUIT_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME La Nuit is a 50ml perfume inspired by Yves Saint Laurent La Nuit de L'Homme Eau de Toilette, priced at INR 799. It explores a spicy aromatic, woody direction with cardamom, bergamot, lavender, cedar and vetiver scent descriptors. This is a HUME inspired alternative, not an original YSL perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME La Nuit, a 50ml perfume inspired by YSL La Nuit de L'Homme Eau de Toilette for INR 799. Discover its spicy aromatic, woody direction and availability.",
  seoKeywords: ["HUME La Nuit", "YSL La Nuit de L'Homme EDT inspired perfume", "La Nuit de L'Homme alternative India", "cardamom lavender perfume", "spicy woody perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // EDT inspiration scent descriptors, not verified HUME formula ingredients.
  notes: { top: ["Cardamom", "Bergamot"], heart: ["Cedar", "Lavender"], base: ["Vetiver", "Tonka Bean"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter", "Spring"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getLaNuitFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME La Nuit inspired by?", answer: "HUME La Nuit is inspired by Yves Saint Laurent La Nuit de L'Homme Eau de Toilette, also searched as YSL La Nuit de L'Homme EDT. It is a HUME fragrance, not an original YSL product, and is not affiliated with that brand." },
    { question: "What scent profile does La Nuit explore?", answer: "The EDT inspiration explores cardamom and bergamot with lavender, cedar, vetiver and tonka bean. These scent descriptors describe the inspiration profile rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by La Nuit EDT, EDP or Bleu Electrique?", answer: "This product is inspired specifically by La Nuit de L'Homme Eau de Toilette. Eau de Parfum, Le Parfum and Bleu Electrique are separate versions." },
    { question: "What is the price and bottle size?", answer: `HUME La Nuit is ${product.size}, listed at INR ${product.price ?? LA_NUIT_PRODUCT.price}.` },
    { question: "Is HUME La Nuit available to order?", answer: product.badges?.soldOut ? "La Nuit is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME La Nuit last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
