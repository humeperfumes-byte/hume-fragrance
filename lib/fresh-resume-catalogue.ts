import "server-only";
import { db } from "@/db";
import { products } from "@/db/schema";
import { NATURALS_PRODUCTS } from "./naturals-data";
import type { ResumeProduct } from "./checkout-resume-cart";
export async function freshResumeCatalogue(): Promise<ResumeProduct[]> {
  const rows = await db.select({ id: products.id, name: products.name, inspiration: products.inspiration, price: products.price, category: products.category, images: products.images, size: products.size, badges: products.badges, priceCurrency: products.priceCurrency }).from(products);
  const naturals = NATURALS_PRODUCTS.flatMap(product => product.sizes.filter(size => size.price >= 100).map(size => ({ id: `${product.id}-${size.ml}`, name: product.name, inspiration: product.name, price: size.price, category: "Naturals", size: size.ml, images: [product.image], priceCurrency: "INR", badges: {} })));
  return [...rows.map(product => ({ ...product, price: Number(product.price) })), ...naturals];
}
