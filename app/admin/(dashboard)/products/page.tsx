import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductsTable } from "./ProductsTable";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif">Catalog Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add, configure, or hide products from your storefront.
        </p>
      </div>

      <ProductsTable initialProducts={allProducts} />
    </div>
  );
}
