import type { PerfumeData } from "../data/perfumes";

export const ANGELS_SHARE_REFERENCE_URL = "https://www.bykilian.com/product/19797/82905/perfume/angels-share/the-liquors";
export const ANGELS_SHARE_IMAGE_PLACEHOLDER = "/images/logo.png";
export const ANGELS_SHARE_PRODUCT: PerfumeData = {
  id: "angels-share", name: "Angels Share", inspiration: "Angels' Share", inspirationBrand: "Kilian",
  visibility: "public", category: "Gourmand / Spicy / Woody", categoryId: "gourmand", gender: "Unisex",
  images: [ANGELS_SHARE_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Angels Share is a 50ml perfume inspired by Kilian Angels' Share, priced at INR 799. It explores a warm gourmand direction with cognac, cinnamon, oak, tonka bean, praline, vanilla and sandalwood scent notes. This is a HUME inspired alternative, not an original Kilian perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Angels Share, a 50ml perfume inspired by Kilian Angels' Share for INR 799. Discover its warm gourmand, spicy, woody direction and current availability.",
  seoKeywords: ["HUME Angels Share", "Kilian Angels Share inspired perfume", "Angels Share alternative India", "cognac cinnamon perfume", "gourmand vanilla perfume India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Inspiration scent descriptors from Kilian; not verified HUME ingredients.
  notes: { top: ["Cognac"], heart: ["Oak", "Cinnamon", "Tonka Bean"], base: ["Sandalwood", "Praline", "Vanilla"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getAngelsShareFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Angels Share inspired by?", answer: "HUME Angels Share is inspired by Kilian Angels' Share. It is a HUME fragrance, not an original Kilian product, and is not affiliated with Kilian." },
    { question: "What scent profile does Angels Share explore?", answer: "The inspiration combines a cognac opening with oak, cinnamon and tonka bean, followed by sandalwood, praline and vanilla. These are scent descriptors for the inspiration profile, not a verified HUME ingredient list or a promise of identical formulation." },
    { question: "Does a cognac note mean this perfume contains drinking cognac?", answer: "Cognac describes the inspiration's scent direction. It does not establish the ingredients or alcohol content of the HUME formula." },
    { question: "What is the price and bottle size?", answer: `HUME Angels Share is ${product.size}, listed at INR ${product.price ?? ANGELS_SHARE_PRODUCT.price}.` },
    { question: "Is HUME Angels Share available to order?", answer: product.badges?.soldOut ? "Angels Share is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Angels Share last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
