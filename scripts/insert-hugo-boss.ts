import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting HUGO BOSS...");
  try {
    await db.insert(products).values({
      id: "hugo-boss",
      name: "HUGO BOSS",
      inspiration: "Hugo Man",
      inspirationBrand: "Hugo Boss",
      woreBy: "Dynamic Men & Urban Pioneers",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Fresh",
      categoryId: "fresh",
      gender: "Men",
      images: ["https://placehold.co/600x600?text=Hugo+Boss"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A timeless, fresh, and aromatic classic that defines clean masculinity. Open with crisp green apple, fresh mint, lavender, zesty grapefruit, and herbaceous basil. The clean aromatic heart reveals clary sage, bright geranium, carnation, and jasmine, settling into a deep, earthy base of fir needle, warm cedarwood, and patchouli. An invigorating, clean, and confident signature scent.",
      seoDescription: "Shop HUGO BOSS by HUME — a premium Hugo Boss Hugo Man inspired clone perfume. Long-lasting, aromatic fresh green apple and mint clone fragrance for men.",
      seoKeywords: [
        "hugo boss clone",
        "hugo man inspired perfume",
        "hugo boss inspired",
        "hugo man alternative",
        "green apple mint perfume men",
        "clean fresh mens fragrance",
        "affordable luxury clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Green Apple", "Mint", "Lavender", "Grapefruit", "Basil"],
        heart: ["Sage", "Geranium", "Carnation", "Jasmine"],
        base: ["Fir Needle", "Cedarwood", "Patchouli"],
      },
      longevity: {
        duration: "7-9 hours",
        sillage: "Moderate & Fresh",
        season: ["Spring", "Summer"],
        occasion: ["Daily Wear", "Office", "Gym", "Casual Outing"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "HUGO BOSS",
        inspiration: "Hugo Man",
        inspirationBrand: "Hugo Boss",
        woreBy: "Dynamic Men & Urban Pioneers",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Fresh",
        categoryId: "fresh",
        gender: "Men",
        images: ["https://placehold.co/600x600?text=Hugo+Boss"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A timeless, fresh, and aromatic classic that defines clean masculinity. Open with crisp green apple, fresh mint, lavender, zesty grapefruit, and herbaceous basil. The clean aromatic heart reveals clary sage, bright geranium, carnation, and jasmine, settling into a deep, earthy base of fir needle, warm cedarwood, and patchouli. An invigorating, clean, and confident signature scent.",
        seoDescription: "Shop HUGO BOSS by HUME — a premium Hugo Boss Hugo Man inspired clone perfume. Long-lasting, aromatic fresh green apple and mint clone fragrance for men.",
        seoKeywords: [
          "hugo boss clone",
          "hugo man inspired perfume",
          "hugo boss inspired",
          "hugo man alternative",
          "green apple mint perfume men",
          "clean fresh mens fragrance",
          "affordable luxury clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Green Apple", "Mint", "Lavender", "Grapefruit", "Basil"],
          heart: ["Sage", "Geranium", "Carnation", "Jasmine"],
          base: ["Fir Needle", "Cedarwood", "Patchouli"],
        },
        longevity: {
          duration: "7-9 hours",
          sillage: "Moderate & Fresh",
          season: ["Spring", "Summer"],
          occasion: ["Daily Wear", "Office", "Gym", "Casual Outing"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("HUGO BOSS inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
