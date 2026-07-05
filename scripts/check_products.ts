import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const { db } = await import("../db");
    const { products } = await import("../db/schema");
    
    const rows = await db.select({
      id: products.id,
      name: products.name,
      price: products.price,
      categoryId: products.categoryId,
    }).from(products);
    
    console.log("Database Products:");
    console.table(rows);
  } catch (err) {
    console.error("Error checking products:", err);
  }
}

main();
