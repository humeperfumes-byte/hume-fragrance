import { config } from "dotenv";
import { resolve } from "path";
import { sql } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local") });

const recommendedIds = [
  "sauvage-noir",
  "homme-intense",
  "allure-sport",
  "guilty-homme",
  "myself",
  "ysl-y-edp",
  "tom-ford-oud-wood",
  "lv-imagination",
  "ombre-leather",
  "acqua-di-gio-profondo",
  "bleu-de-chanel",
  "creed-aventus",
  "night-out",
  "pacific-chill",
  "angels-share"
];

async function run() {
  const { db } = await import("../db/index");
  const { products } = await import("../db/schema");

  console.log("Updating recommended kit flags in database...");

  try {
    for (const id of recommendedIds) {
      await db.execute(sql`
        UPDATE products 
        SET badges = jsonb_set(COALESCE(badges, '{}'::jsonb), '{recommendedSample}', 'true'::jsonb)
        WHERE id = ${id}
      `);
      console.log(`Marked ${id} as recommended sample.`);
    }
    console.log("Recommended kit seeded successfully!");
  } catch (err) {
    console.error("Failed to seed recommended kit:", err);
  }
}

run();
