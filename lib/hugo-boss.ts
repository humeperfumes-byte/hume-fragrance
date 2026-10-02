import type { PerfumeData } from "../data/perfumes";

export const HUGO_BOSS_REFERENCE_URL = "https://www.hugoboss.com/us/4.2-fl.-oz.-125-ml-eau-de-toilette-hugo-man/hbna58034772_999.html";
export const HUGO_BOSS_IMAGE_PLACEHOLDER = "/images/logo.png";
export const HUGO_BOSS_PRODUCT: PerfumeData = {
  id: "hugo-boss", name: "Hugo Boss Man", inspiration: "Hugo Man", inspirationBrand: "Hugo Boss",
  visibility: "public", category: "Fresh / Aromatic / Woody", categoryId: "fresh", gender: "Men",
  images: [HUGO_BOSS_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Hugo Boss Man is a 50ml perfume inspired by HUGO Man by Hugo Boss, priced at INR 799. It explores crisp green apple, fresh aromatic notes and a woody fir-balsam direction. This is a HUME inspired alternative, not an original Hugo Boss perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Hugo Boss Man, a 50ml perfume inspired by HUGO Man by Hugo Boss for INR 799. Discover its fresh, aromatic, woody direction and current availability.",
  seoKeywords: ["HUME Hugo Boss Man", "Hugo Man inspired perfume", "Hugo Boss Man alternative India", "green apple aromatic perfume", "fresh woody perfume for men India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Inspiration scent descriptors grouped for browsing; not verified HUME ingredients.
  notes: { top: ["Green Apple", "Grapefruit", "Basil"], heart: ["Sage", "Jasmine"], base: ["Fir Balsam", "Cedar Wood", "Patchouli"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Spring", "Summer"], occasion: ["Daytime", "Office", "Casual"] },
  reviews: [],
};
export function getHugoBossFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Hugo Boss Man inspired by?", answer: "HUME Hugo Boss Man is inspired by HUGO Man by Hugo Boss. It is a HUME fragrance, not an original Hugo Boss product, and is not affiliated with that brand." },
    { question: "What scent profile does Hugo Boss Man explore?", answer: "The inspiration combines crisp green apple and fresh aromatic notes with a woody fir-balsam direction. The note groups are scent descriptors for the inspiration, not a verified HUME ingredient pyramid or a promise of identical formulation." },
    { question: "Is the inspiration HUGO Man or BOSS Bottled?", answer: "This product takes its inspiration from HUGO Man, which is a separate fragrance from BOSS Bottled." },
    { question: "What is the price and bottle size?", answer: `HUME Hugo Boss Man is ${product.size}, listed at INR ${product.price ?? HUGO_BOSS_PRODUCT.price}.` },
    { question: "Is HUME Hugo Boss Man available to order?", answer: product.badges?.soldOut ? "Hugo Boss Man is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Hugo Boss Man last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
