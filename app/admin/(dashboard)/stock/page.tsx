import { Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAllPublicProducts } from "@/lib/db/products";
import StockManagementClient from "./StockManagementClient";

const nonPerfumeCategoryIds = new Set(["discovery-set", "rose-water", "car-fragrance", "car-freshener"]);

export default async function AdminStockPage() {
  const products = await getAllPublicProducts();
  const perfumeProducts = products
    .filter((product) => !nonPerfumeCategoryIds.has(product.categoryId))
    .map((product) => ({ id: product.id, name: product.name.trim() }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
      <div className="admin-page-intro-copy">
        <Badge className="mb-3 border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/10">
          <Warehouse className="mr-1 h-3.5 w-3.5" /> Frontend draft
        </Badge>
        <h1 className="text-2xl font-semibold text-white">Stock Management</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">
          Plan fragrance oils in grams, tester inventory and packaging materials. Nothing on this page is connected to the database yet.
        </p>
      </div>
      <StockManagementClient perfumeProducts={perfumeProducts} />
    </div>
  );
}
