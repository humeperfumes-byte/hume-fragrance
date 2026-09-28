import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting PURPLE OUD...");
  try {
    await db.insert(products).values({
      id: "purple-oud",
      name: "PURPLE OUD",
      inspiration: "Purple Oud",
      inspirationBrand: "Dior",
      woreBy: "Aristocrats & Modern Royals",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Oud",
      categoryId: "oud",
      gender: "Unisex",
      images: ["https://placehold.co/600x600?text=Purple+Oud"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A sophisticated, sparkling, and modern take on traditional oud. Open with the bright energy of fresh orange and spicy pink pepper. The heart blooms with exotic saffron, resting on a clean, elegant base of precious agarwood (oud) and smoky vetiver. A vibrant, woody-spicy fragrance that redefines oud with effortless luxury.",
      seoDescription: "Buy PURPLE OUD by HUME — a premium Dior Purple Oud inspired clone perfume. Long-lasting sparkling fresh spicy orange, saffron, and oud clone fragrance.",
      seoKeywords: [
        "dior purple oud clone",
        "purple oud dupe",
        "dior inspired perfume",
        "purple oud alternative",
        "sparkling citrus oud fragrance",
        "luxury unisex clone perfume",
        "affordable purple oud clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Orange", "Pink Pepper", "Bergamot"],
        heart: ["Saffron", "Spicy Accords"],
        base: ["Agarwood (Oud)", "Vetiver", "Guaiac Wood"],
      },
      longevity: {
        duration: "8-10 hours",
        sillage: "Moderate to Strong",
        season: ["Spring", "Autumn", "Winter"],
        occasion: ["Daily Luxury", "Office", "Evening Wear", "Special Occasions"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "PURPLE OUD",
        inspiration: "Purple Oud",
        inspirationBrand: "Dior",
        woreBy: "Aristocrats & Modern Royals",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Oud",
        categoryId: "oud",
        gender: "Unisex",
        images: ["https://placehold.co/600x600?text=Purple+Oud"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A sophisticated, sparkling, and modern take on traditional oud. Open with the bright energy of fresh orange and spicy pink pepper. The heart blooms with exotic saffron, resting on a clean, elegant base of precious agarwood (oud) and smoky vetiver. A vibrant, woody-spicy fragrance that redefines oud with effortless luxury.",
        seoDescription: "Buy PURPLE OUD by HUME — a premium Dior Purple Oud inspired clone perfume. Long-lasting sparkling fresh spicy orange, saffron, and oud clone fragrance.",
        seoKeywords: [
          "dior purple oud clone",
          "purple oud dupe",
          "dior inspired perfume",
          "purple oud alternative",
          "sparkling citrus oud fragrance",
          "luxury unisex clone perfume",
          "affordable purple oud clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Orange", "Pink Pepper", "Bergamot"],
          heart: ["Saffron", "Spicy Accords"],
          base: ["Agarwood (Oud)", "Vetiver", "Guaiac Wood"],
        },
        longevity: {
          duration: "8-10 hours",
          sillage: "Moderate to Strong",
          season: ["Spring", "Autumn", "Winter"],
          occasion: ["Daily Luxury", "Office", "Evening Wear", "Special Occasions"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("PURPLE OUD inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
