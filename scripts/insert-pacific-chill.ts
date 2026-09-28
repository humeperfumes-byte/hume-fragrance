import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting PACIFIC CHILL...");
  try {
    await db.insert(products).values({
      id: "pacific-chill",
      name: "PACIFIC CHILL",
      inspiration: "Pacific Chill",
      inspirationBrand: "Louis Vuitton",
      woreBy: "Celebrities & Coastal Adventurers",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Fresh",
      categoryId: "fresh",
      gender: "Unisex",
      images: ["https://placehold.co/600x600?text=Pacific+Chill"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A revitalizing, wellness-inspired fragrance that captures the energy of the ocean. Open with a burst of crisp blackcurrant, zesty citron, lemon, sweet orange, and refreshing mint. The heart blooms with succulent apricot, green basil, and a touch of delicate May rose, resting on a warm base of sweet fig, dates, and ambrette seed. An uplifting scent that brings coastal serenity to life.",
      seoDescription: "Buy PACIFIC CHILL by HUME — a premium Louis Vuitton Pacific Chill inspired clone perfume. Long-lasting fresh perfume alternative with black currant, mint, and apricot. Affordable luxury unisex fragrance.",
      seoKeywords: [
        "louis vuitton pacific chill clone",
        "pacific chill dupe",
        "louis vuitton inspired perfume",
        "pacific chill alternative",
        "best fresh summer perfume",
        "blackcurrant mint fragrance",
        "affordable luxury clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Black Currant", "Citron", "Mint", "Lemon", "Orange", "Coriander"],
        heart: ["Apricot", "Basil", "Carrot Seeds", "May Rose"],
        base: ["Fig", "Dates", "Ambrette"],
      },
      longevity: {
        duration: "7-9 hours",
        sillage: "Moderate & Refreshing",
        season: ["Spring", "Summer"],
        occasion: ["Daily Wear", "Sporty", "Vacation", "Casual"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "PACIFIC CHILL",
        inspiration: "Pacific Chill",
        inspirationBrand: "Louis Vuitton",
        woreBy: "Celebrities & Coastal Adventurers",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Fresh",
        categoryId: "fresh",
        gender: "Unisex",
        images: ["https://placehold.co/600x600?text=Pacific+Chill"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A revitalizing, wellness-inspired fragrance that captures the energy of the ocean. Open with a burst of crisp blackcurrant, zesty citron, lemon, sweet orange, and refreshing mint. The heart blooms with succulent apricot, green basil, and a touch of delicate May rose, resting on a warm base of sweet fig, dates, and ambrette seed. An uplifting scent that brings coastal serenity to life.",
        seoDescription: "Buy PACIFIC CHILL by HUME — a premium Louis Vuitton Pacific Chill inspired clone perfume. Long-lasting fresh perfume alternative with black currant, mint, and apricot. Affordable luxury unisex fragrance.",
        seoKeywords: [
          "louis vuitton pacific chill clone",
          "pacific chill dupe",
          "louis vuitton inspired perfume",
          "pacific chill alternative",
          "best fresh summer perfume",
          "blackcurrant mint fragrance",
          "affordable luxury clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Black Currant", "Citron", "Mint", "Lemon", "Orange", "Coriander"],
          heart: ["Apricot", "Basil", "Carrot Seeds", "May Rose"],
          base: ["Fig", "Dates", "Ambrette"],
        },
        longevity: {
          duration: "7-9 hours",
          sillage: "Moderate & Refreshing",
          season: ["Spring", "Summer"],
          occasion: ["Daily Wear", "Sporty", "Vacation", "Casual"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("PACIFIC CHILL inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
