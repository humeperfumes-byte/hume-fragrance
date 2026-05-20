import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductsTable } from "./ProductsTable";
import { getKitAvailability } from "@/lib/kit-availability";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let allProducts: (typeof products.$inferSelect)[] = [];
  let kitAvailability = { outOfStock: false };
  let dbError = false;

  try {
    [allProducts, kitAvailability] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)),
      getKitAvailability(),
    ]);
  } catch (error) {
    console.error("Products page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl">Catalog Management</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">
              The products table is missing columns. Run <code className="bg-white/10 px-2 py-1 rounded text-xs">npm run db:push</code> in your terminal to sync the schema, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl">Catalog Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add, configure, or hide products from your storefront.
        </p>
      </div>

      <ProductsTable initialProducts={allProducts} initialKitOutOfStock={kitAvailability.outOfStock} />
    </div>
  );
}
