import type { PerfumeData } from "../data/perfumes";

export const NIGHT_OUT_REFERENCE_URL = "https://india.afnan.com/products/9pm-night-out";
export const NIGHT_OUT_IMAGE_PLACEHOLDER = "/images/logo.png";

export const NIGHT_OUT_PRODUCT: PerfumeData = {
  id: "night-out",
  name: "Night Out",
  inspiration: "9 PM Night Out",
  inspirationBrand: "Afnan",
  visibility: "public",
  category: "Fruity / Spicy / Amber",
  categoryId: "amber",
  gender: "Unisex",
  images: [NIGHT_OUT_IMAGE_PLACEHOLDER],
  price: 799,
  priceCurrency: "INR",
  size: "50ml",
  description: "HUME Night Out is a 50ml unisex perfume inspired by Afnan 9 PM Night Out, priced at INR 799. Its inspiration is a fruity, spicy, amber profile with a bright fruit opening, a warm spiced heart and a woody dry-down. Made by HUME, it is an inspired alternative, not the original Afnan perfume or a claim of identical performance.",
  seoDescription: "Explore HUME Night Out, a 50ml unisex perfume inspired by Afnan 9 PM Night Out for INR 799. Discover its fruity, spicy, amber direction and current availability.",
  seoKeywords: ["HUME Night Out", "Afnan 9 PM Night Out inspired perfume", "Afnan Night Out alternative India", "9PM Night Out inspired fragrance", "fruity spicy amber perfume", "unisex evening perfume India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Profile reference: Afnan's official note pyramid. These are scent-note
  // descriptors, not an ingredient list or a claim of identical formulation.
  notes: {
    top: ["Dragon Fruit", "Bergamot", "Cognac", "Lavender", "Apple"],
    heart: ["Cardamom", "Mahonial", "Suede", "Toffee", "Cedar"],
    base: ["Tonka Bean", "Akigalawood", "Ambrofix", "Patchouli"],
  },
  longevity: {
    duration: "Varies with skin, weather and application; wear-test results pending",
    sillage: "Wear-test results pending",
    season: ["Autumn", "Winter"],
    occasion: ["Evening", "Night Out", "Date Night", "Party"],
  },
  reviews: [],
};

export function getNightOutFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Night Out inspired by?", answer: "HUME Night Out is inspired by Afnan 9 PM Night Out. It is a HUME fragrance, not an original Afnan product, and is not affiliated with Afnan." },
    { question: "What scent profile does Night Out explore?", answer: "Its inspiration combines fruit, spice and amber: fruit and aromatic opening notes, a cardamom, toffee and suede heart, and a tonka-led woody base. Note names describe the inspiration's scent profile rather than a list of ingredients." },
    { question: "Are Afnan 9 PM and 9 PM Night Out the same fragrance?", answer: "No. They are separate Afnan fragrances. This HUME product takes its inspiration from 9 PM Night Out, rather than the original 9 PM or 9 PM Rebel." },
    { question: "What is the price and bottle size?", answer: `HUME Night Out is ${product.size}, listed at INR ${product.price ?? NIGHT_OUT_PRODUCT.price}.` },
    { question: "Is HUME Night Out available to order?", answer: product.badges?.soldOut ? "Night Out is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Night Out last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
