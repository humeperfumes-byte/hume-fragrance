import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting HER...");
  try {
    await db.insert(products).values({
      id: "her",
      name: "HER",
      inspiration: "Burberry Her",
      inspirationBrand: "Burberry",
      woreBy: "Vibrant Women & Modern Dreamers",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Sweet",
      categoryId: "sweet",
      gender: "Women",
      images: ["https://placehold.co/600x600?text=Burberry+Her"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A vibrant, fruity, and gourmand fragrance that captures the lively spirit of London. Open with a mouthwatering burst of sweet strawberry, red raspberry, blackberry, sour cherry, and blackcurrant. The heart blooms into a delicate blend of violet and jasmine, resting on a warm, sophisticated base of vanilla, rich cashmeran, clean musk, amber, and earthy oakmoss.",
      seoDescription: "Buy HER by HUME — a premium Burberry Her Eau de Parfum inspired clone perfume. Long-lasting sweet floral fruity gourmand clone with strawberry, jasmine, and vanilla.",
      seoKeywords: [
        "burberry her clone",
        "burberry her dupe",
        "burberry inspired perfume",
        "burberry her alternative",
        "strawberry vanilla perfume",
        "womens sweet fruity fragrance",
        "best burberry clone",
        "affordable luxury clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Strawberry", "Raspberry", "Blackberry", "Sour Cherry", "Black Currant"],
        heart: ["Violet", "Jasmine"],
        base: ["Vanilla", "Cashmeran", "Musk", "Amber", "Oakmoss"],
      },
      longevity: {
        duration: "8-10 hours",
        sillage: "Moderate to Strong",
        season: ["Spring", "Summer", "Autumn"],
        occasion: ["Daily Wear", "Brunch", "Casual Outing", "Romantic Dates"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "HER",
        inspiration: "Burberry Her",
        inspirationBrand: "Burberry",
        woreBy: "Vibrant Women & Modern Dreamers",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Sweet",
        categoryId: "sweet",
        gender: "Women",
        images: ["https://placehold.co/600x600?text=Burberry+Her"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A vibrant, fruity, and gourmand fragrance that captures the lively spirit of London. Open with a mouthwatering burst of sweet strawberry, red raspberry, blackberry, sour cherry, and blackcurrant. The heart blooms into a delicate blend of violet and jasmine, resting on a warm, sophisticated base of vanilla, rich cashmeran, clean musk, amber, and earthy oakmoss.",
        seoDescription: "Buy HER by HUME — a premium Burberry Her Eau de Parfum inspired clone perfume. Long-lasting sweet floral fruity gourmand clone with strawberry, jasmine, and vanilla.",
        seoKeywords: [
          "burberry her clone",
          "burberry her dupe",
          "burberry inspired perfume",
          "burberry her alternative",
          "strawberry vanilla perfume",
          "womens sweet fruity fragrance",
          "best burberry clone",
          "affordable luxury clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Strawberry", "Raspberry", "Blackberry", "Sour Cherry", "Black Currant"],
          heart: ["Violet", "Jasmine"],
          base: ["Vanilla", "Cashmeran", "Musk", "Amber", "Oakmoss"],
        },
        longevity: {
          duration: "8-10 hours",
          sillage: "Moderate to Strong",
          season: ["Spring", "Summer", "Autumn"],
          occasion: ["Daily Wear", "Brunch", "Casual Outing", "Romantic Dates"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("HER inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
