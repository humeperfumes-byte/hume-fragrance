import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Inserting ALTHAIR...");
  try {
    await db.insert(products).values({
      id: "althair",
      name: "ALTHAIR",
      inspiration: "Althaïr",
      inspirationBrand: "Parfums de Marly",
      woreBy: "Aristocrats & Connoisseurs",
      woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
      category: "Oriental",
      categoryId: "oriental",
      gender: "Men",
      images: ["https://placehold.co/600x600?text=Althair"],
      price: "1499.00",
      priceCurrency: "INR",
      description: "A majestic, modern vanilla masterpiece that strikes a perfect balance between warmth and freshness. Open with warm cinnamon, cardamom, sweet orange blossom, and bergamot. The heart is defined by a luxurious, creamy Bourbon vanilla and balsamic elemi resin. The dry down is a rich gourmand blend of praline, candied almond, guaiac wood, musk, and clean ambroxan, creating a highly sophisticated and irresistible trail.",
      seoDescription: "Buy ALTHAIR by HUME — a premium Parfums de Marly Althaïr inspired clone perfume. Long-lasting, warm vanilla gourmand cologne alternative with cinnamon, cardamom, and praline.",
      seoKeywords: [
        "parfums de marly althair clone",
        "althair dupe",
        "parfums de marly inspired perfume",
        "althair alternative",
        "bourbon vanilla praline fragrance",
        "mens warm spicy perfume",
        "best althair clone",
        "affordable luxury clone",
      ],
      badges: { showInDiscoverySet: true },
      notes: {
        top: ["Cinnamon", "Cardamom", "Orange Blossom", "Bergamot"],
        heart: ["Bourbon Vanilla", "Elemi Resin", "Spicy Accords"],
        base: ["Praline", "Guaiac Wood", "Musk", "Ambroxan", "Tonka Bean", "Candied Almond"],
      },
      longevity: {
        duration: "10-12 hours",
        sillage: "Strong & Radiant",
        season: ["Autumn", "Winter"],
        occasion: ["Evening Wear", "Formal Events", "Date Night", "Casual Luxury"],
      },
      size: "50ml",
      visibility: "seo_only",
    }).onConflictDoUpdate({
      target: products.id,
      set: {
        name: "ALTHAIR",
        inspiration: "Althaïr",
        inspirationBrand: "Parfums de Marly",
        woreBy: "Aristocrats & Connoisseurs",
        woreByImageUrl: "https://placehold.co/600x600?text=Celeb",
        category: "Oriental",
        categoryId: "oriental",
        gender: "Men",
        images: ["https://placehold.co/600x600?text=Althair"],
        price: "1499.00",
        priceCurrency: "INR",
        description: "A majestic, modern vanilla masterpiece that strikes a perfect balance between warmth and freshness. Open with warm cinnamon, cardamom, sweet orange blossom, and bergamot. The heart is defined by a luxurious, creamy Bourbon vanilla and balsamic elemi resin. The dry down is a rich gourmand blend of praline, candied almond, guaiac wood, musk, and clean ambroxan, creating a highly sophisticated and irresistible trail.",
        seoDescription: "Buy ALTHAIR by HUME — a premium Parfums de Marly Althaïr inspired clone perfume. Long-lasting, warm vanilla gourmand cologne alternative with cinnamon, cardamom, and praline.",
        seoKeywords: [
          "parfums de marly althair clone",
          "althair dupe",
          "parfums de marly inspired perfume",
          "althair alternative",
          "bourbon vanilla praline fragrance",
          "mens warm spicy perfume",
          "best althair clone",
          "affordable luxury clone",
        ],
        badges: { showInDiscoverySet: true },
        notes: {
          top: ["Cinnamon", "Cardamom", "Orange Blossom", "Bergamot"],
          heart: ["Bourbon Vanilla", "Elemi Resin", "Spicy Accords"],
          base: ["Praline", "Guaiac Wood", "Musk", "Ambroxan", "Tonka Bean", "Candied Almond"],
        },
        longevity: {
          duration: "10-12 hours",
          sillage: "Strong & Radiant",
          season: ["Autumn", "Winter"],
          occasion: ["Evening Wear", "Formal Events", "Date Night", "Casual Luxury"],
        },
        size: "50ml",
        visibility: "seo_only",
      }
    });
    console.log("ALTHAIR inserted/updated successfully!");
  } catch (err) {
    console.error("Failed to insert product:", err);
  }
}

run();
