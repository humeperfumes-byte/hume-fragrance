import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting NIGHT OUT...");
  try {
    await db.insert(products).values({
      id: "night-out",
      name: "NIGHT OUT",
      inspiration: "9 PM Night Out",
      inspirationBrand: "Afnan",
      woreBy: "Celebrities & Nightlife Icons",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Oriental",
      categoryId: "oriental",
      gender: "Unisex",
      images: ["https://placehold.co/600x600?text=Night+Out"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "An electric, intoxicating fragrance designed for unforgettable evenings. Open with exotic dragon fruit, rich cognac, and crisp apple, leading to a sophisticated heart of sweet toffee, suede, and warm cardamom. The deep, seductive base of tonka bean, patchouli, and radiating ambery notes leaves an irresistible, long-lasting trail of mystery.",
      seoDescription: "Experience NIGHT OUT by HUME — a premium Afnan 9 PM Night Out inspired clone perfume. Long-lasting, rich, and seductive scent alternative with dragon fruit, cognac, and tonka bean. Affordable luxury for a perfect night out.",
      seoKeywords: [
        "afnan night out clone",
        "9 pm night out dupe",
        "afnan inspired perfume",
        "afnan 9pm night out alternative",
        "night out perfume",
        "dragon fruit cognac perfume",
        "affordable afnan clone",
        "best clubbing fragrance",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Dragon Fruit", "Lavender", "Cognac", "Apple", "Bergamot"],
        heart: ["Toffee", "Suede", "Cardamom", "Cedar", "Mahonial"],
        base: ["Tonka Bean", "Akigalawood", "Ambrofix", "Patchouli"],
      },
      longevity: {
        duration: "8-10 hours",
        sillage: "Strong & Enveloping",
        season: ["Autumn", "Winter", "Spring"],
        occasion: ["Night Out", "Clubbing", "Dates", "Party"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "NIGHT OUT",
        inspiration: "9 PM Night Out",
        inspirationBrand: "Afnan",
        woreBy: "Celebrities & Nightlife Icons",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Oriental",
        categoryId: "oriental",
        gender: "Unisex",
        images: ["https://placehold.co/600x600?text=Night+Out"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "An electric, intoxicating fragrance designed for unforgettable evenings. Open with exotic dragon fruit, rich cognac, and crisp apple, leading to a sophisticated heart of sweet toffee, suede, and warm cardamom. The deep, seductive base of tonka bean, patchouli, and radiating ambery notes leaves an irresistible, long-lasting trail of mystery.",
        seoDescription: "Experience NIGHT OUT by HUME — a premium Afnan 9 PM Night Out inspired clone perfume. Long-lasting, rich, and seductive scent alternative with dragon fruit, cognac, and tonka bean. Affordable luxury for a perfect night out.",
        seoKeywords: [
          "afnan night out clone",
          "9 pm night out dupe",
          "afnan inspired perfume",
          "afnan 9pm night out alternative",
          "night out perfume",
          "dragon fruit cognac perfume",
          "affordable afnan clone",
          "best clubbing fragrance",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Dragon Fruit", "Lavender", "Cognac", "Apple", "Bergamot"],
          heart: ["Toffee", "Suede", "Cardamom", "Cedar", "Mahonial"],
          base: ["Tonka Bean", "Akigalawood", "Ambrofix", "Patchouli"],
        },
        longevity: {
          duration: "8-10 hours",
          sillage: "Strong & Enveloping",
          season: ["Autumn", "Winter", "Spring"],
          occasion: ["Night Out", "Clubbing", "Dates", "Party"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("NIGHT OUT inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
