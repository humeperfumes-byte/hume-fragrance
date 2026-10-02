import { config } from "dotenv";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import postgres from "postgres";
import { LA_NUIT_PRODUCT as product } from "../lib/la-nuit";

config({ path: ".env.local", quiet: true });
const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function main() {
  await sql.begin(async (transaction) => {
    const tx = transaction as unknown as typeof sql;
    const before = await tx`select * from products order by id for update`;
    if (before.some((row) => row.id === product.id)) {
      console.log("La Nuit already exists; no changes made. Edit its images in admin.");
      return;
    }
    await mkdir("output/catalog-backups", { recursive: true });
    const backup = `output/catalog-backups/before-la-nuit-${Date.now()}.json`;
    await writeFile(backup, JSON.stringify(before, null, 2));
    await tx`insert into products (id,name,inspiration,inspiration_brand,wore_by_image_url,
      category,category_id,gender,images,price,price_currency,description,seo_description,
      seo_keywords,badges,notes,longevity,size,visibility)
      values (${product.id},${product.name},${product.inspiration},${product.inspirationBrand},
      ${"/images/logo.png"},${product.category},${product.categoryId},${product.gender},
      ${tx.json(product.images)},${String(product.price)},${"INR"},${product.description},
      ${product.seoDescription},${tx.json(product.seoKeywords)},${tx.json(product.badges!)},
      ${tx.json(product.notes)},${tx.json(product.longevity)},${product.size},${product.visibility!})`;
    for (const category of [{ id: "spicy", label: "Spicy" }, { id: "woody", label: "Woody" }, { id: "aromatic", label: "Aromatic" }]) {
      await tx`insert into product_categories (product_id,category_id,category_label)
        values (${product.id},${category.id},${category.label})`;
    }
    const after = await tx`select * from products order by id`;
    if (hash(before) !== hash(after.filter((row) => row.id !== product.id))) {
      throw new Error("An existing product changed; rolling back");
    }
    console.log(JSON.stringify({ insertedId: product.id, soldOut: true, price: product.price,
      size: product.size, protectedProductsUnchanged: before.length, backup }));
  });
}
main().catch((error) => { console.error("La Nuit insert failed:", error.code ?? error.message); process.exitCode = 1; })
  .finally(() => sql.end());
