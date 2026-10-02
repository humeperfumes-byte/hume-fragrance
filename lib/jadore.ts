import type { PerfumeData } from "../data/perfumes";

export const JADORE_REFERENCE_URL = "https://www.dior.com/en_int/beauty/products/j%E2%80%99adore-eau-de-parfum-Y0998031.html";
export const JADORE_IMAGE_PLACEHOLDER = "/images/logo.png";
export const JADORE_PRODUCT: PerfumeData = {
  id: "jadore", name: "J'adore", inspiration: "J'adore Eau de Parfum", inspirationBrand: "Dior",
  visibility: "public", category: "Floral", categoryId: "floral", gender: "Women",
  images: [JADORE_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME J'adore is a 50ml perfume inspired by Dior J'adore Eau de Parfum, priced at INR 799. It explores a floral bouquet direction with ylang-ylang, Damascus rose, jasmine grandiflorum and jasmine sambac scent descriptors. This is a HUME inspired alternative, not an original Dior perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME J'adore, a 50ml perfume inspired by Dior J'adore Eau de Parfum for INR 799. Discover its floral bouquet direction and current availability.",
  seoKeywords: ["HUME J'adore", "Dior Jadore inspired perfume", "J'adore EDP alternative India", "floral jasmine rose perfume", "floral perfume for women India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Floral reference notes grouped for display, not a verified progression or HUME ingredient pyramid.
  notes: { top: ["Ylang-Ylang"], heart: ["Damascus Rose"], base: ["Jasmine Grandiflorum", "Jasmine Sambac"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Spring", "Summer", "Autumn"], occasion: ["Daytime", "Office", "Special Events"] },
  reviews: [],
};
export function getJadoreFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME J'adore inspired by?", answer: "HUME J'adore is inspired by Dior J'adore Eau de Parfum. It is a HUME fragrance, not an original Dior product, and is not affiliated with Dior." },
    { question: "What scent profile does J'adore explore?", answer: "The inspiration explores a floral bouquet with ylang-ylang, Damascus rose, jasmine grandiflorum and jasmine sambac. These reference notes are grouped for browsing rather than a verified top-to-base progression, HUME ingredient list or promise of identical formulation." },
    { question: "Is this inspired by J'adore EDP, L'Or or Parfum d'eau?", answer: "This product is inspired by J'adore Eau de Parfum. J'adore L'Or and Parfum d'eau are separate editions." },
    { question: "What is the price and bottle size?", answer: `HUME J'adore is ${product.size}, listed at INR ${product.price ?? JADORE_PRODUCT.price}.` },
    { question: "Is HUME J'adore available to order?", answer: product.badges?.soldOut ? "J'adore is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME J'adore last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
