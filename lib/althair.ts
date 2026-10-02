import type { PerfumeData } from "../data/perfumes";

export const ALTHAIR_REFERENCE_URL = "https://parfums-de-marly.com/products/althair";
export const ALTHAIR_IMAGE_PLACEHOLDER = "/images/logo.png";

export const ALTHAIR_PRODUCT: PerfumeData = {
  id: "althair",
  name: "Althair",
  inspiration: "Althair",
  inspirationBrand: "Parfums de Marly",
  visibility: "public",
  category: "Vanilla / Amber / Woody",
  categoryId: "vanilla",
  gender: "Unisex",
  images: [ALTHAIR_IMAGE_PLACEHOLDER],
  price: 799,
  priceCurrency: "INR",
  size: "50ml",
  description: "HUME Althair is a 50ml perfume inspired by Parfums de Marly Althaïr, priced at INR 799. Its inspiration explores Bourbon vanilla and praline with orange blossom, warm spices and woods. This is a HUME inspired alternative, not an original Parfums de Marly perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Althair, a 50ml perfume inspired by Parfums de Marly Althaïr for INR 799. Discover its vanilla, spicy, woody direction and current availability.",
  seoKeywords: ["HUME Althair", "Parfums de Marly Althair inspired perfume", "PDM Althair alternative India", "Althaïr inspired fragrance", "vanilla praline perfume", "warm woody vanilla perfume India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Reference profile from PDM's official Althaïr page; scent descriptors,
  // not an ingredient declaration or a verified identical HUME formulation.
  notes: {
    top: ["Bergamot", "Mandarin", "Elemi"],
    heart: ["Orange Blossom", "Cinnamon", "Cardamom"],
    base: ["Bourbon Vanilla", "Guaiac Wood", "Praline"],
  },
  longevity: {
    duration: "Varies with skin, weather and application; wear-test results pending",
    sillage: "Wear-test results pending",
    season: ["Autumn", "Winter"],
    occasion: ["Evening", "Date Night", "Casual", "Special Events"],
  },
  reviews: [],
};

export function getAlthairFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Althair inspired by?", answer: "HUME Althair is inspired by Parfums de Marly Althaïr, also searched as PDM Althair. It is a HUME fragrance, not an original Parfums de Marly product, and is not affiliated with that brand." },
    { question: "What scent profile does Althair explore?", answer: "The inspiration brings together Bourbon vanilla, praline and woods with orange blossom and warm spices. The note pyramid references the original scent direction rather than HUME's ingredient list or an identical formulation." },
    { question: "Is this inspired by Althair or Althair Exclusif?", answer: "This product takes its inspiration from the original Parfums de Marly Althaïr, not Althaïr Exclusif." },
    { question: "What is the price and bottle size?", answer: `HUME Althair is ${product.size}, listed at INR ${product.price ?? ALTHAIR_PRODUCT.price}.` },
    { question: "Is HUME Althair available to order?", answer: product.badges?.soldOut ? "Althair is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Althair last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
