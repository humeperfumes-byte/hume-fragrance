import { Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StockManagementClient from "./StockManagementClient";

export default function AdminStockPage() {
  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
      <div>
        <Badge className="mb-3 border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/10">
          <Warehouse className="mr-1 h-3.5 w-3.5" /> Frontend draft
        </Badge>
        <h1 className="text-2xl font-semibold text-white">Stock Management</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">
          Plan fragrance oils in grams, tester inventory and packaging materials. Nothing on this page is connected to the database yet.
        </p>
      </div>
      <StockManagementClient />
    </div>
  );
}
