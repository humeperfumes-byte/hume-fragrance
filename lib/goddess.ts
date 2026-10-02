import type { PerfumeData } from "../data/perfumes";

export const GODDESS_REFERENCE_URL = "https://uk.burberry.com/burberry-goddess-eau-de-parfum-for-women-50ml-p40835971";
export const GODDESS_IMAGE_PLACEHOLDER = "/images/logo.png";
export const GODDESS_PRODUCT: PerfumeData = {
  id: "goddess", name: "Goddess", inspiration: "Goddess Eau de Parfum", inspirationBrand: "Burberry",
  visibility: "public", category: "Vanilla / Aromatic / Gourmand", categoryId: "vanilla", gender: "Women",
  images: [GODDESS_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Goddess is a 50ml perfume inspired by the original Burberry Goddess Eau de Parfum, priced at INR 799. It explores an aromatic gourmand direction centred on vanilla and lavender scent descriptors. This is a HUME inspired alternative, not an original Burberry perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Goddess, a 50ml perfume inspired by Burberry Goddess Eau de Parfum for INR 799. Discover its vanilla, lavender gourmand direction and availability.",
  seoKeywords: ["HUME Goddess", "Burberry Goddess inspired perfume", "Goddess Eau de Parfum alternative India", "vanilla lavender perfume", "gourmand perfume for women India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Official reference themes grouped for browsing; not a verified HUME progression or ingredient pyramid.
  notes: { top: ["Lavender"], heart: ["Vanilla Accord"], base: ["Vanilla"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter", "Spring"], occasion: ["Daytime", "Evening", "Date Night"] },
  reviews: [],
};
export function getGoddessFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Goddess inspired by?", answer: "HUME Goddess is inspired by the original Burberry Goddess Eau de Parfum. It is a HUME fragrance, not an original Burberry product, and is not affiliated with that brand." },
    { question: "What scent profile does Goddess explore?", answer: "Burberry describes the original inspiration as a gourmand fragrance with a trio of vanillas and lavender. HUME Goddess explores that vanilla and aromatic direction. Reference notes are grouped for browsing rather than a verified top-to-base progression, HUME ingredient list or promise of identical formulation." },
    { question: "Is this inspired by Goddess EDP, Intense or Parfum?", answer: "This product is inspired specifically by the original Goddess Eau de Parfum. Goddess Eau de Parfum Intense and Goddess Parfum are separate versions." },
    { question: "What is the price and bottle size?", answer: `HUME Goddess is ${product.size}, listed at INR ${product.price ?? GODDESS_PRODUCT.price}.` },
    { question: "Is HUME Goddess available to order?", answer: product.badges?.soldOut ? "Goddess is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Goddess last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
