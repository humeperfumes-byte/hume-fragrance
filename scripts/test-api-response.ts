import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");
  
  const all = await db.select().from(products);
  console.log("Database products check:");
  all.forEach((p: any) => {
    if (p.badges?.recommendedSample) {
      console.log(`- Product: ${p.name} (id: ${p.id}), Badges:`, p.badges);
    }
  });

  const { getAllProducts } = await import("../lib/db/products");
  const cachedProducts = await getAllProducts();
  console.log("\nCached products check:");
  cachedProducts.forEach((p: any) => {
    if (p.badges?.recommendedSample) {
      console.log(`- Product: ${p.name} (id: ${p.id}), Badges:`, p.badges);
    }
  });
}

run();
