import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting MOST WANTED...");
  try {
    await db.insert(products).values({
      id: "most-wanted",
      name: "MOST WANTED",
      inspiration: "The Most Wanted Parfum",
      inspirationBrand: "Azzaro",
      woreBy: "Bold Men & Risk-Takers",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Woody",
      categoryId: "woody",
      gender: "Men",
      images: ["https://placehold.co/600x600?text=Most+Wanted"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A highly sophisticated, fiery, and deeply intense fragrance designed for the man who dares to get what he wants. Sparked by an explosive top note of fresh red ginger, transitioning into a heart of rich, incandescent woody accords, and resting on a base of luxurious, sweet Bourbon vanilla. An addictive scent trail that is magnetic, warm, and utterly irresistible.",
      seoDescription: "Shop MOST WANTED by HUME — a premium Azzaro The Most Wanted Parfum inspired clone perfume. Long-lasting, warm woody spicy clone fragrance with ginger and bourbon vanilla.",
      seoKeywords: [
        "azzaro most wanted clone",
        "most wanted parfum dupe",
        "azzaro inspired perfume",
        "most wanted alternative",
        "bourbon vanilla perfume men",
        "best winter fragrance clone",
        "affordable luxury clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Red Ginger", "Cardamom", "Spicy Accords"],
        heart: ["Incandescent Woods", "Cedarwood", "Lavender"],
        base: ["Bourbon Vanilla", "Amberwood", "Vetiver"],
      },
      longevity: {
        duration: "9-11 hours",
        sillage: "Strong & Heavy",
        season: ["Autumn", "Winter"],
        occasion: ["Night Out", "Date Night", "Evening Wear", "Special Events"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "MOST WANTED",
        inspiration: "The Most Wanted Parfum",
        inspirationBrand: "Azzaro",
        woreBy: "Bold Men & Risk-Takers",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Woody",
        categoryId: "woody",
        gender: "Men",
        images: ["https://placehold.co/600x600?text=Most+Wanted"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A highly sophisticated, fiery, and deeply intense fragrance designed for the man who dares to get what he wants. Sparked by an explosive top note of fresh red ginger, transitioning into a heart of rich, incandescent woody accords, and resting on a base of luxurious, sweet Bourbon vanilla. An addictive scent trail that is magnetic, warm, and utterly irresistible.",
        seoDescription: "Shop MOST WANTED by HUME — a premium Azzaro The Most Wanted Parfum inspired clone perfume. Long-lasting, warm woody spicy clone fragrance with ginger and bourbon vanilla.",
        seoKeywords: [
          "azzaro most wanted clone",
          "most wanted parfum dupe",
          "azzaro inspired perfume",
          "most wanted alternative",
          "bourbon vanilla perfume men",
          "best winter fragrance clone",
          "affordable luxury clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Red Ginger", "Cardamom", "Spicy Accords"],
          heart: ["Incandescent Woods", "Cedarwood", "Lavender"],
          base: ["Bourbon Vanilla", "Amberwood", "Vetiver"],
        },
        longevity: {
          duration: "9-11 hours",
          sillage: "Strong & Heavy",
          season: ["Autumn", "Winter"],
          occasion: ["Night Out", "Date Night", "Evening Wear", "Special Events"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("MOST WANTED inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
