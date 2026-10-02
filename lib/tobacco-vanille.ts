import type { PerfumeData } from "../data/perfumes";

export const TOBACCO_VANILLE_REFERENCE_URL = "https://www.tomfordbeauty.com/products/tobacco-vanille-eau-de-parfum";
export const TOBACCO_VANILLE_IMAGE_PLACEHOLDER = "/images/logo.png";
export const TOBACCO_VANILLE_PRODUCT: PerfumeData = {
  id: "tobacco-vanille", name: "Tobacco Vanille", inspiration: "Tobacco Vanille", inspirationBrand: "Tom Ford",
  visibility: "public", category: "Spicy / Vanilla / Woody", categoryId: "vanilla", gender: "Unisex",
  images: [TOBACCO_VANILLE_IMAGE_PLACEHOLDER], price: 799, priceCurrency: "INR", size: "50ml",
  description: "HUME Tobacco Vanille is a 50ml perfume inspired by Tom Ford Tobacco Vanille, priced at INR 799. It explores a warm tobacco, vanilla and woody direction with spice, tonka bean, cocoa and dried-fruit scent descriptors. This is a HUME inspired alternative, not an original Tom Ford perfume or a claim of identical formulation or performance.",
  seoDescription: "Explore HUME Tobacco Vanille, a 50ml perfume inspired by Tom Ford Tobacco Vanille for INR 799. Discover its warm tobacco, vanilla and woody direction and availability.",
  seoKeywords: ["HUME Tobacco Vanille", "Tom Ford Tobacco Vanille inspired perfume", "Tobacco Vanille alternative India", "tobacco vanilla perfume", "warm spicy unisex perfume India"],
  badges: { soldOut: true, comingSoon: false, showInDiscoverySet: false, recommendedSample: false },
  // Official reference notes grouped for browsing, not a verified progression or HUME ingredient pyramid.
  notes: { top: ["Tobacco Leaf", "Ginger", "Spice Notes"], heart: ["Vanilla", "Tonka Bean", "Cocoa"], base: ["Dried Fruit Accord", "Sweet Wood Sap"] },
  longevity: { duration: "Varies with skin, weather and application; wear-test results pending", sillage: "Wear-test results pending", season: ["Autumn", "Winter"], occasion: ["Evening", "Date Night", "Special Events"] },
  reviews: [],
};
export function getTobaccoVanilleFaqItems(product: { size: string; price?: number; badges?: { soldOut?: boolean } }) {
  return [
    { question: "What is HUME Tobacco Vanille inspired by?", answer: "HUME Tobacco Vanille is inspired by Tom Ford Tobacco Vanille Eau de Parfum. It is a HUME fragrance, not an original Tom Ford product, and is not affiliated with that brand." },
    { question: "What scent profile does Tobacco Vanille explore?", answer: "The inspiration explores tobacco, vanilla and warm woods with spice, tonka bean, cocoa and dried-fruit accords. These reference notes are grouped for browsing rather than a verified top-to-base progression, HUME ingredient list or promise of identical formulation." },
    { question: "Does the tobacco note establish that HUME contains tobacco or nicotine?", answer: "Tobacco is a scent descriptor for the inspiration. It does not establish the ingredients or nicotine content of the HUME formula; consult the product's own ingredient label for composition information." },
    { question: "What is the price and bottle size?", answer: `HUME Tobacco Vanille is ${product.size}, listed at INR ${product.price ?? TOBACCO_VANILLE_PRODUCT.price}.` },
    { question: "Is HUME Tobacco Vanille available to order?", answer: product.badges?.soldOut ? "Tobacco Vanille is currently out of stock. Purchases and discovery-set sample selection are unavailable while it is sold out. Use the availability notification form for updates." : "Check the current stock status on this product page before ordering. Discovery-set sample eligibility is shown separately in the builder." },
    { question: "How long does HUME Tobacco Vanille last?", answer: "Product-specific wear-test results are not yet published. Longevity and projection vary with skin, weather and application; the original fragrance's performance should not be assumed for HUME's formulation." },
  ];
}
