import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting ANGELS SHARE...");
  try {
    await db.insert(products).values({
      id: "angels-share",
      name: "ANGELS SHARE",
      inspiration: "Angels' Share",
      inspirationBrand: "Kilian",
      woreBy: "Connoisseurs & Evening Elite",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Oriental",
      categoryId: "oriental",
      gender: "Unisex",
      images: ["https://placehold.co/600x600?text=Angels+Share"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A luxurious, boozy, and deeply comforting masterpiece that evokes the finest aged liquors. Open with a rich, intoxicating top note of golden cognac. The heart reveals a warm blend of cinnamon, tonka bean, and dry oak wood, settling into a highly addictive gourmand base of creamy praline, sweet vanilla, candied almond, and smooth sandalwood.",
      seoDescription: "Buy ANGELS SHARE by HUME — a premium Kilian Angels' Share inspired clone perfume. Long-lasting boozy, warm sweet gourmand fragrance with cognac, cinnamon, and vanilla.",
      seoKeywords: [
        "kilian angels share clone",
        "angels share dupe",
        "kilian inspired perfume",
        "angels share alternative",
        "boozy cognac cinnamon perfume",
        "best gourmand vanilla fragrance",
        "affordable luxury clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Cognac", "Amber Accord"],
        heart: ["Cinnamon", "Tonka Bean", "Oak Wood", "Hedione"],
        base: ["Vanilla", "Praline", "Sandalwood", "Candied Almond"],
      },
      longevity: {
        duration: "9-11 hours",
        sillage: "Strong & Cozy",
        season: ["Autumn", "Winter"],
        occasion: ["Date Night", "Evening Wear", "Special Occasions", "Casual Luxury"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "ANGELS SHARE",
        inspiration: "Angels' Share",
        inspirationBrand: "Kilian",
        woreBy: "Connoisseurs & Evening Elite",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Oriental",
        categoryId: "oriental",
        gender: "Unisex",
        images: ["https://placehold.co/600x600?text=Angels+Share"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A luxurious, boozy, and deeply comforting masterpiece that evokes the finest aged liquors. Open with a rich, intoxicating top note of golden cognac. The heart reveals a warm blend of cinnamon, tonka bean, and dry oak wood, settling into a highly addictive gourmand base of creamy praline, sweet vanilla, candied almond, and smooth sandalwood.",
        seoDescription: "Buy ANGELS SHARE by HUME — a premium Kilian Angels' Share inspired clone perfume. Long-lasting boozy, warm sweet gourmand fragrance with cognac, cinnamon, and vanilla.",
        seoKeywords: [
          "kilian angels share clone",
          "angels share dupe",
          "kilian inspired perfume",
          "angels share alternative",
          "boozy cognac cinnamon perfume",
          "best gourmand vanilla fragrance",
          "affordable luxury clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Cognac", "Amber Accord"],
          heart: ["Cinnamon", "Tonka Bean", "Oak Wood", "Hedione"],
          base: ["Vanilla", "Praline", "Sandalwood", "Candied Almond"],
        },
        longevity: {
          duration: "9-11 hours",
          sillage: "Strong & Cozy",
          season: ["Autumn", "Winter"],
          occasion: ["Date Night", "Evening Wear", "Special Occasions", "Casual Luxury"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("ANGELS SHARE inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
