import type { PerfumeData } from "../data/perfumes";

export const NOIR_EXTREME_REFERENCE_URL = "https://www.tomfordbeauty.com/products/noir-extreme-eau-de-parfum";
export const NOIR_EXTREME_IMAGE_PLACEHOLDER = "/images/logo.png";
export const NOIR_EXTREME_PRODUCT: PerfumeData = {
  id: "noir-extreme", name: "Noir Extreme", inspiration: "Noir Extreme", inspirationBrand: "Tom Ford",
  visibility: "public", category: "Amber / Woody / Gourmand", categoryId: "amber", gender: "Men",
  images: [NOIR_EXTREME_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Noir Extreme is a 50ml perfume inspired by Tom Ford Noir Extreme, priced at INR 799. It explores a warm spicy, amber and woody direction with citrus, saffron, kulfi, floral notes, sandalwood and vanilla scent descriptors. This is a HUME inspired alternative, not an original Tom Ford perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Noir Extreme, a 50ml perfume inspired by Tom Ford Noir Extreme for INR 799. Discover its warm spicy, amber and woody direction and availability.",
  seoKeywords: ["HUME Noir Extreme", "Tom Ford Noir Extreme inspired perfume", "Noir Extreme alternative India", "kulfi amber vanilla perfume", "warm woody perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Official reference notes grouped for browsing, not a verified progression or HUME ingredient pyramid.
  notes: { top: ["Neroli", "Saffron", "Warm Spices"], heart: ["Kulfi Accord", "Rose", "Jasmine", "Orange Flower"], base: ["Amber", "Sandalwood", "Vanilla"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getNoirExtremeFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Noir Extreme inspired by?", answer: "HUME Noir Extreme is inspired by Tom Ford Noir Extreme Eau de Parfum. It is a HUME fragrance, not an original Tom Ford product, and is not affiliated with that brand." },
    { question: "What scent profile does Noir Extreme explore?", answer: "The EDP inspiration explores warm spice and citrus, a kulfi accord and floral notes, followed by amber, sandalwood and vanilla. These reference notes are grouped for browsing rather than a verified top-to-base progression, HUME ingredient list or promise of identical formulation." },
    { question: "Is this inspired by Noir Extreme EDP or Parfum?", answer: "This product is inspired specifically by Tom Ford Noir Extreme Eau de Parfum. Noir Extreme Parfum is a separate version." },
    { question: "What is the price and bottle size?", answer: `HUME Noir Extreme is ${product.size}, listed at INR ${product.price ?? NOIR_EXTREME_PRODUCT.price}.` },
    { question: "Is HUME Noir Extreme available to order?", answer: product.badges?.soldOut ? "Noir Extreme is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Noir Extreme last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
