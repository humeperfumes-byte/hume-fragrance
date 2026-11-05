import { db } from "@/db";
import { products, productCategories, catalogCategories } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProductsTable } from "./ProductsTable";
import { getKitAvailability } from "@/lib/kit-availability";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  let allProducts: (typeof products.$inferSelect & {
    categoryIds: string[];
    categoryTags: {
      id: string;
      label: string;
      visible: boolean;
      sortOrder: number;
    }[];
  })[] = [];
  let kitAvailability = { outOfStock: false };
  let dbError = false;

  try {
    const [rows, availability, mappings, definitions] = await Promise.all([
      db.select().from(products).orderBy(desc(products.createdAt)),
      getKitAvailability(),
      db.select().from(productCategories),
      db.select().from(catalogCategories),
    ]);
    kitAvailability = availability;
    allProducts = rows.map((product) => {
      const ids = [
        ...new Set([
          product.categoryId,
          ...mappings
            .filter((m) => m.productId === product.id)
            .map((m) => m.categoryId),
        ]),
      ];
      return {
        ...product,
        category:
          definitions.find((c) => c.id === product.categoryId)?.name ||
          product.category,
        categoryIds: ids,
        categoryTags: ids.map((id) => {
          const c = definitions.find((c) => c.id === id);
          return {
            id,
            label: c?.name || id,
            visible: c?.visible ?? true,
            sortOrder: c?.sortOrder ?? 200,
          };
        }),
      };
    });
  } catch (error) {
    console.error("Products page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
        <div className="admin-page-intro-copy">
          <h1 className="text-2xl">Catalog Management</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium text-amber-300">
              Catalog temporarily unavailable
            </h3>
            <p className="text-sm text-white/50">
              We could not load your catalog. Please refresh in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
      <div className="admin-page-intro-copy">
        <h1 className="text-2xl">Catalog Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add, configure, or hide products from your storefront.
        </p>
      </div>

      <ProductsTable
        initialProducts={allProducts}
        initialKitOutOfStock={kitAvailability.outOfStock}
      />
    </div>
  );
}
