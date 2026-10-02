import type { PerfumeData } from "../data/perfumes";

export const EROS_REFERENCE_URL = "https://www.versace.com/us/en/men/accessories/fragrances-body-care/eros/eros-edp-100-ml-blue/R740110-R100MLS_RNUL.html";
export const EROS_IMAGE_PLACEHOLDER = "/images/logo.png";
export const EROS_PRODUCT: PerfumeData = {
  id: "eros", name: "Eros", inspiration: "Eros Eau de Parfum", inspirationBrand: "Versace",
  visibility: "public", category: "Fresh / Woody / Amber", categoryId: "woody", gender: "Men",
  images: [EROS_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Eros is a 50ml perfume inspired by Versace Eros Eau de Parfum, priced at INR 799. It explores a fresh, woody amber direction with citrus, mint, candied apple, aromatic notes and vanilla scent descriptors. This is a HUME inspired alternative, not an original Versace perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Eros, a 50ml perfume inspired by Versace Eros Eau de Parfum for INR 799. Discover its citrus, mint, woody vanilla direction and availability.",
  seoKeywords: ["HUME Eros", "Versace Eros EDP inspired perfume", "Eros Eau de Parfum alternative India", "mint apple vanilla perfume", "woody amber perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // EDP reference scent descriptors, not verified HUME formula ingredients.
  notes: { top: ["Italian Lemon", "Mandarin", "Mint", "Candied Apple"], heart: ["Geranium", "Clary Sage", "AmberMax"], base: ["Cedarwood", "Vetiver", "Patchouli", "Sandalwood", "Vanilla"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Spring", "Autumn", "Winter"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getErosFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Eros inspired by?", answer: "HUME Eros is inspired by Versace Eros Eau de Parfum. It is a HUME fragrance, not an original Versace product, and is not affiliated with Versace." },
    { question: "What scent profile does Eros explore?", answer: "The EDP inspiration combines lemon, mandarin, mint and candied apple with geranium, clary sage and an amber accord, followed by woods, vetiver, patchouli and vanilla. These scent descriptors describe the inspiration profile rather than a verified HUME ingredient list or identical formulation." },
    { question: "Is this inspired by Eros EDP, EDT or Eros Flame?", answer: "This product is inspired specifically by Versace Eros Eau de Parfum. Eros Eau de Toilette, Eros Parfum and Eros Flame are separate versions." },
    { question: "What is the price and bottle size?", answer: `HUME Eros is ${product.size}, listed at INR ${product.price ?? EROS_PRODUCT.price}.` },
    { question: "Is HUME Eros available to order?", answer: product.badges?.soldOut ? "Eros is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Eros last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
