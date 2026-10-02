import type { PerfumeData } from "../data/perfumes";

export const BRIGHT_CRYSTAL_REFERENCE_URL = "https://www.versace.com/us/en/women/accessories/fragrances-body-care/bright-crystal/bright-crystal-edt-90-ml-pink/R510032-R090MLS_RNUL.html";
export const BRIGHT_CRYSTAL_IMAGE_PLACEHOLDER = "/images/logo.png";
export const BRIGHT_CRYSTAL_PRODUCT: PerfumeData = {
  id: "bright-crystal", name: "Bright Crystal", inspiration: "Bright Crystal", inspirationBrand: "Versace",
  visibility: "public", category: "Floral / Fruity / Musky", categoryId: "floral", gender: "Women",
  images: [BRIGHT_CRYSTAL_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Bright Crystal is a 50ml perfume inspired by the original Versace Bright Crystal Eau de Toilette, priced at INR 799. It explores a fresh floral, fruity and musky direction with yuzu, pomegranate, peony, magnolia and lotus scent descriptors. This is a HUME inspired alternative, not an original Versace perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Bright Crystal, a 50ml perfume inspired by Versace Bright Crystal Eau de Toilette for INR 799. Discover its floral, fruity, musky direction and availability.",
  seoKeywords: ["HUME Bright Crystal", "Versace Bright Crystal inspired perfume", "Bright Crystal EDT alternative India", "pomegranate peony perfume", "fresh floral perfume for women India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Official EDT inspiration scent descriptors, not verified HUME formula ingredients.
  notes: { top: ["Yuzu", "Iced Accord", "Pomegranate"], heart: ["Peony", "Magnolia", "Lotus Flower"], base: ["Acajou", "Vegetal Amber", "Musk"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Spring", "Summer"], occasion: ["Daytime", "Office", "Casual"] },
  reviews: [],
};
export function getBrightCrystalFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Bright Crystal inspired by?", answer: "HUME Bright Crystal is inspired by the original Versace Bright Crystal Eau de Toilette. It is a HUME fragrance, not an original Versace product, and is not affiliated with that brand." },
    { question: "What scent profile does Bright Crystal explore?", answer: "The EDT inspiration combines yuzu, an iced accord and pomegranate with peony, magnolia and lotus flower, followed by acajou, vegetal amber and musk. These scent descriptors describe the inspiration profile rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by Bright Crystal EDT or Absolu?", answer: "This product is inspired specifically by the original Bright Crystal Eau de Toilette. Bright Crystal Absolu and Bright Crystal Parfum are separate versions." },
    { question: "What is the price and bottle size?", answer: `HUME Bright Crystal is ${product.size}, listed at INR ${product.price ?? BRIGHT_CRYSTAL_PRODUCT.price}.` },
    { question: "Is HUME Bright Crystal available to order?", answer: product.badges?.soldOut ? "Bright Crystal is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Bright Crystal last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
